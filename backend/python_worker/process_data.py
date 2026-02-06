# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: backend/python_worker/process_data.py                      ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import os
import time
from typing import Any, Dict, List, Optional, Sequence, Union

import requests
from dotenv import load_dotenv


load_dotenv()


HF_TOKEN = os.getenv("HF_TOKEN")
DEFAULT_HF_TEXT_MODEL = os.getenv("HF_TEXT_MODEL", "gpt2")
DEFAULT_HF_EMBED_MODEL = os.getenv("HF_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


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

    url = f"https://api-inference.huggingface.co/models/{model}"
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

    for attempt in range(max_retries + 1):
        resp = requests.post(url, json=payload, headers=headers, timeout=timeout_s)
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
            try:
                data = resp.json()
            except Exception:
                data = resp.text

            message = "Hugging Face inference failed"
            if isinstance(data, dict) and isinstance(data.get("error"), str) and data["error"].strip():
                message = data["error"].strip()
            raise RuntimeError(f"{message} (status={resp.status_code})")

        return resp.json()

    raise RuntimeError("Hugging Face inference failed")


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


import hashlib
import json
import sys

# ... existing imports ...

def extract_patterns(content: str) -> Dict[str, Any]:
    """Extract structural and semantic patterns from code content."""
    # Simplified structural pattern: Normalize whitespace and remove common delimiters
    import re
    # Remove comments
    content_no_comments = re.sub(r'#.*', '', content)
    if '"""' in content_no_comments:
        content_no_comments = re.sub(r'""".*?"""', '', content_no_comments, flags=re.DOTALL)
    
    # Normalize whitespace: remove all spaces, tabs, newlines
    normalized = re.sub(r'\s+', '', content_no_comments)
    
    # Create a similarity hash of the normalized content
    similarity_hash = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    
    # Identify basic pattern type (heuristic)
    pattern_id = "generic_code"
    description = "Standard code block"
    
    if "def " in content or "class " in content:
        pattern_id = "python_logic"
        description = "Python functional or class definition"
    elif "import " in content or "from " in content:
        pattern_id = "module_imports"
        description = "Module import structure"
    elif "const " in content or "async function" in content:
        pattern_id = "javascript_logic"
        description = "JavaScript functional logic"

    return {
        "patternId": pattern_id,
        "description": description,
        "similarityHash": similarity_hash
    }

def handle_pattern_scan(payload: Dict[str, Any]) -> Dict[str, Any]:
    content = payload.get("content", "")
    file_path = payload.get("file_path", "unknown")
    patterns = extract_patterns(content)
    return {"ok": True, "file_path": file_path, "patterns": patterns}

def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "scan":
        try:
            input_data = sys.stdin.read()
            if input_data:
                payload = json.loads(input_data)
                result = handle_pattern_scan(payload)
                print(json.dumps(result))
            sys.exit(0)
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}))
            sys.exit(1)
            
    print("∞ Heady Data Worker Initialized ∞")
    # ... rest of existing main ...


if __name__ == "__main__":
    main()
