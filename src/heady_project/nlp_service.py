from .utils import get_logger

logger = get_logger(__name__)

class NLPService:
    def generate_response(self, prompt: str) -> str:
        logger.info(f"Generating response for: {prompt[:50]}...")
        return f"Heady AI Response to: {prompt}"

    def summarize_text(self, text: str) -> str:
        logger.info("Summarizing text...")
        return "Text summary placeholder."

nlp_service = NLPService()
