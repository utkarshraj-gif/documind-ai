from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseAIProvider(ABC):
    @abstractmethod
    async def summarize_document(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Returns:
        {
            "document_type": str,
            "summary": str,
            "key_points": List[str]
        }
        """
        pass

    @abstractmethod
    async def extract_information(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Returns:
        {
            "document_type": str,
            "person_names": List[str],
            "organizations": List[str],
            "dates": List[str],
            "addresses": List[str],
            "amounts": List[str],
            "document_numbers": List[str]
        }
        """
        pass

    @abstractmethod
    async def answer_question(self, question: str, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Returns:
        {
            "answer": str,
            "sources": [
                {
                    "page": int,
                    "text": str
                }
            ]
        }
        """
        pass
