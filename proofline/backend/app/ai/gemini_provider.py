import json
import re
from typing import List, Dict, Any
import google.generativeai as genai
from app.ai.base import BaseAIProvider
from app.config import settings

GROUNDING_SYSTEM_PROMPT = """You are answering questions about an uploaded document.
Use ONLY the supplied document context.
Do not invent facts.
If the information cannot be found in the document, say:
'I couldn't find that information in the uploaded document.'
When possible, provide the relevant source passage and page.
Never return fabricated information."""


class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str = "", model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=GROUNDING_SYSTEM_PROMPT
            )
        else:
            self.model = None

    def _format_context(self, pages: List[Dict[str, Any]]) -> str:
        blocks = []
        for p in pages:
            page_num = p.get("page", 1)
            text = p.get("text", "")
            blocks.append(f"--- PAGE {page_num} ---\n{text}")
        return "\n\n".join(blocks)

    def _clean_json_response(self, text: str) -> str:
        # Strip markdown ```json codeblocks if present
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        return text

    async def summarize_document(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.model:
            raise ValueError("Gemini API key is not configured.")

        context = self._format_context(pages)
        prompt = f"""Analyze this document and produce an executive summary and key points.
Return ONLY a valid JSON object with this exact structure:
{{
  "document_type": "Invoice | Contract | Financial Report | Agreement | Technical Document | Other",
  "summary": "Concise 2-4 sentence executive summary grounded strictly in the document text.",
  "key_points": [
    "Key bullet point 1",
    "Key bullet point 2",
    "Key bullet point 3"
  ]
}}

DOCUMENT CONTEXT:
{context}"""

        response = self.model.generate_content(prompt)
        raw_text = self._clean_json_response(response.text)
        try:
            data = json.loads(raw_text)
            return {
                "document_type": data.get("document_type", "Document"),
                "summary": data.get("summary", "Summary unavailable."),
                "key_points": data.get("key_points", [])
            }
        except Exception:
            return {
                "document_type": "Document",
                "summary": response.text[:400],
                "key_points": ["Document analysis generated."]
            }

    async def extract_information(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.model:
            raise ValueError("Gemini API key is not configured.")

        context = self._format_context(pages)
        prompt = f"""Extract all key structured entities from the following document.
Return ONLY a valid JSON object conforming strictly to this format:
{{
  "document_type": "Invoice / Agreement / etc.",
  "person_names": ["Name 1", "Name 2"],
  "organizations": ["Org 1", "Org 2"],
  "dates": ["Date 1", "Date 2"],
  "addresses": ["Address 1"],
  "amounts": ["Amount 1", "Amount 2"],
  "document_numbers": ["Document or invoice or reference number"]
}}
If any category has no entries found in the document, use an empty list []. Do not invent entities.

DOCUMENT CONTEXT:
{context}"""

        response = self.model.generate_content(prompt)
        raw_text = self._clean_json_response(response.text)
        try:
            return json.loads(raw_text)
        except Exception:
            return {
                "document_type": "Document",
                "person_names": [],
                "organizations": [],
                "dates": [],
                "addresses": [],
                "amounts": [],
                "document_numbers": []
            }

    async def answer_question(self, question: str, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.model:
            raise ValueError("Gemini API key is not configured.")

        context = self._format_context(pages)
        prompt = f"""DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

Instructions:
1. Answer the question using ONLY the facts stated directly in the document context.
2. If the information is not found in the document, reply: "I couldn't find that information in the uploaded document." and return an empty sources list.
3. For every piece of information used, cite the exact page number (integer) and the exact supporting excerpt snippet.
4. Output ONLY valid JSON in this exact structure:
{{
  "answer": "Your factual grounded answer here.",
  "sources": [
    {{
      "page": 1,
      "text": "Exact excerpt from page 1"
    }}
  ]
}}"""

        response = self.model.generate_content(prompt)
        raw_text = self._clean_json_response(response.text)
        try:
            data = json.loads(raw_text)
            return {
                "answer": data.get("answer", "I couldn't find that information in the uploaded document."),
                "sources": data.get("sources", [])
            }
        except Exception:
            return {
                "answer": response.text,
                "sources": []
            }
