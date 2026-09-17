import logging
from typing import List, Dict, Any
from app.config import settings
from app.ai.base import BaseAIProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.local_provider import LocalProvider

logger = logging.getLogger("proofline.ai")


class AIService:
    def __init__(self):
        self.provider: BaseAIProvider = self._initialize_provider()

    def _initialize_provider(self) -> BaseAIProvider:
        if settings.AI_PROVIDER.lower() == "gemini" and settings.GEMINI_API_KEY.strip():
            try:
                logger.info(f"Initializing GeminiProvider with model {settings.GEMINI_MODEL}")
                return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
            except Exception as e:
                logger.warning(f"Failed to initialize GeminiProvider: {e}. Falling back to LocalProvider.")
                return LocalProvider()
        else:
            if not settings.GEMINI_API_KEY.strip():
                logger.info("GEMINI_API_KEY is not configured. Running with Local Grounded Provider.")
            return LocalProvider()

    async def summarize_document(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            return await self.provider.summarize_document(pages)
        except Exception as e:
            logger.error(f"Error in summarize_document: {e}. Falling back to local provider.")
            fallback = LocalProvider()
            return await fallback.summarize_document(pages)

    async def extract_information(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            return await self.provider.extract_information(pages)
        except Exception as e:
            logger.error(f"Error in extract_information: {e}. Falling back to local provider.")
            fallback = LocalProvider()
            return await fallback.extract_information(pages)

    async def answer_question(self, question: str, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            return await self.provider.answer_question(question, pages)
        except Exception as e:
            logger.error(f"Error in answer_question: {e}. Falling back to local provider.")
            fallback = LocalProvider()
            return await fallback.answer_question(question, pages)


ai_service = AIService()
