import os
import sys
import json
import time
import logging
from typing import Any, Dict, List, Optional, Sequence, Union

import requests
from dotenv import load_dotenv


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()


HF_TOKEN = os.getenv("HF_TOKEN")
DEFAULT_HF_TEXT_MODEL = os.getenv("HF_TEXT_MODEL", "gpt2")
DEFAULT_HF_EMBED_MODEL = os.getenv("HF_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
HEADY_PY_WORKER_TIMEOUT_MS = int(os.getenv("HEADY_PY_WORKER_TIMEOUT_MS", "90000"))


def _sleep_ms(ms: int) -> None:
    time.sleep(ms / 1000.0)


def hf_infer(
    *,
    model: str,
    inputs: Any,
    parameters: Optional[Dict[str, Any]] = None,
    options: Optional[Dict[str, Any]] = None,
    timeout_s: int = 60,
    max_retries: int = 2,
) -> Any:
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN is not set")

    # Try router API first, fallback to legacy API
    base_urls = [
        f"https://router.huggingface.co/models/{model}",
        f"https://api-inference.huggingface.co/models/{model}"
    ]
    
    payload: Dict[str, Any] = {"inputs": inputs}
    if parameters is not None:
        payload["parameters"] = parameters
    if options is not None:
        payload["options"] = options

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    for base_url in base_urls:
        for attempt in range(max_retries + 1):
            resp = requests.post(base_url, json=payload, headers=headers, timeout=timeout_s)
            if resp.status_code == 503 and attempt < max_retries:
                try:
                    data = resp.json()
                    estimated = data.get("estimated_time")
                    wait_ms = int(estimated * 1000) + 250 if isinstance(estimated, (int, float)) else 1500
                except Exception:
                    wait_ms = 1500
                _sleep_ms(wait_ms)
                continue

            if resp.status_code < 200 or resp.status_code >= 300:
                if resp.status_code == 404 and base_url == base_urls[0]:
                    # Try next base URL for 404 on router
                    break
                try:
                    data = resp.json()
                except Exception:
                    data = resp.text

                message = "Hugging Face inference failed"
                if isinstance(data, dict) and isinstance(data.get("error"), str) and data["error"].strip():
                    message = data["error"].strip()
                raise RuntimeError(f"{message} (status={resp.status_code})")

            return resp.json()

    raise RuntimeError("Hugging Face inference failed - all endpoints exhausted")


def hf_generate(
    prompt: str,
    *,
    model: Optional[str] = None,
    parameters: Optional[Dict[str, Any]] = None,
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    used_model = model or DEFAULT_HF_TEXT_MODEL
    merged_options: Dict[str, Any] = {"wait_for_model": True}
    if isinstance(options, dict):
        merged_options.update(options)

    data = hf_infer(model=used_model, inputs=prompt, parameters=parameters, options=merged_options)
    output = None
    if isinstance(data, list) and data and isinstance(data[0], dict):
        if isinstance(data[0].get("generated_text"), str):
            output = data[0]["generated_text"]

    return {"model": used_model, "output": output, "raw": data}


def _mean_pool_2d(matrix: Sequence[Sequence[float]]) -> List[float]:
    rows = len(matrix)
    if rows == 0:
        return []
    cols = len(matrix[0])
    out = [0.0] * cols
    for row in matrix:
        for i in range(cols):
            out[i] += float(row[i])
    return [v / rows for v in out]


def _pool_feature_extraction_output(output: Any) -> Any:
    if not isinstance(output, list):
        return output
    if not output:
        return output
    if not isinstance(output[0], list):
        return output
    if not output[0] or not isinstance(output[0][0], list):
        return _mean_pool_2d(output)

    pooled = []
    for item in output:
        if not isinstance(item, list) or not item or not isinstance(item[0], list):
            pooled.append(item)
        else:
            pooled.append(_mean_pool_2d(item))
    return pooled


def hf_embed(
    text: Union[str, Sequence[str]],
    *,
    model: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    used_model = model or DEFAULT_HF_EMBED_MODEL
    merged_options: Dict[str, Any] = {"wait_for_model": True}
    if isinstance(options, dict):
        merged_options.update(options)

    data = hf_infer(model=used_model, inputs=text, options=merged_options)
    embeddings = _pool_feature_extraction_output(data)
    return {"model": used_model, "embeddings": embeddings, "raw": data}


def qa_interface(question: str, context: str = "", model: Optional[str] = None, parameters: Optional[Dict[str, Any]] = None, max_new_tokens: int = 256, request_id: str = "") -> Dict[str, Any]:
    """QA interface for Node.js manager communication"""
    try:
        used_model = model or DEFAULT_HF_TEXT_MODEL
        merged_parameters = {
            "max_new_tokens": max_new_tokens,
            "temperature": 0.2,
            "return_full_text": False,
            **(parameters or {}),
        }
        
        prompt = f"""You are Heady Systems Q&A. Provide a clear, safe, and concise answer. Do not reveal secrets, API keys, tokens, or private data.

Context:
{context}

Question:
{question}

Answer:"""
        
        result = hf_generate(prompt, model=used_model, parameters=merged_parameters)
        answer = result.get("output", "")
        
        # Remove prompt echo if present
        if answer.startswith(prompt):
            answer = answer[len(prompt):].strip()
            
        return {
            "ok": True,
            "answer": answer,
            "model": used_model,
            "backend": "python-hf",
            "request_id": request_id,
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "backend": "python-hf",
            "request_id": request_id,
        }


def handle_qa_command():
    """Handle QA command from stdin (JSON input)"""
    try:
        # Read JSON from stdin
        input_data = json.loads(sys.stdin.read())
        
        question = input_data.get("question", "")
        context = input_data.get("context", "")
        model = input_data.get("model")
        parameters = input_data.get("parameters")
        max_new_tokens = input_data.get("max_new_tokens", 256)
        request_id = input_data.get("request_id", "")
        
        result = qa_interface(question, context, model, parameters, max_new_tokens, request_id)
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            "ok": False,
            "error": str(e),
            "backend": "python-hf",
        }
        print(json.dumps(error_result))
        sys.exit(1)


def handle_health_check() -> None:
    """Handle health check command"""
    health_status = {
        "status": "healthy",
        "service": "heady-python-worker",
        "timestamp": int(time.time()),
        "hf_token_configured": bool(HF_TOKEN),
        "default_text_model": DEFAULT_HF_TEXT_MODEL,
        "default_embed_model": DEFAULT_HF_EMBED_MODEL,
        "worker_timeout_ms": HEADY_PY_WORKER_TIMEOUT_MS,
    }
    print(json.dumps(health_status))
    sys.exit(0)


def main() -> None:
    """Main entry point for the Python worker"""
    # Check if we're being called with a specific command
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "qa":
            handle_qa_command()
        elif command == "health":
            handle_health_check()
        elif command == "test":
            # Placeholder for test functionality
            logger.info("Test functionality not yet implemented")
            print(json.dumps({"status": "not_implemented", "message": "Test functionality not yet implemented"}))
            sys.exit(0)
        else:
            logger.error(f"Unknown command: {command}")
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    # Default behavior: worker initialization
    logger.info("∞ Heady Data Worker Initialized ∞")
    logger.info("∞ Heady Hugging Face Bridge Online ∞")
    print("∞ Heady Data Worker Initialized ∞")
    print("∞ Heady Hugging Face Bridge Online ∞")

    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        logger.info("Worker shutting down gracefully...")
        print("Worker shutting down gracefully...")
        sys.exit(0)


if __name__ == "__main__":
    main()
