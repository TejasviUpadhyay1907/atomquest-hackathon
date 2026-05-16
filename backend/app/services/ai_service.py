from openai import OpenAI
from app.core.config import settings
from typing import List, Dict, Optional


class AIService:
    """Service for AI-powered goal suggestions using OpenAI"""
    
    def __init__(self):
        self._client = None
        self._initialized = False
    
    def _get_client(self):
        """Lazy initialization of OpenAI client"""
        if not self._initialized:
            self._initialized = True
            if settings.OPENAI_API_KEY:
                try:
                    # Support OpenRouter for access to multiple AI models including FREE Gemini
                    api_key = settings.OPENAI_API_KEY
                    print(f"DEBUG: API Key starts with: {api_key[:10]}...")
                    
                    if api_key.startswith("sk-or-"):
                        print("DEBUG: Using OpenRouter with base_url: https://openrouter.ai/api/v1")
                        self._client = OpenAI(
                            api_key=api_key,
                            base_url="https://openrouter.ai/api/v1"
                        )
                    else:
                        print("DEBUG: Using OpenAI directly (no base_url)")
                        self._client = OpenAI(api_key=api_key)
                except Exception as e:
                    print(f"WARNING: Failed to initialize OpenAI client: {e}")
                    self._client = None
        return self._client
    
    def suggest_goals(
        self,
        role: str,
        department: str,
        thrust_area: Optional[str] = None
    ) -> List[Dict]:
        """
        Generate AI-powered goal suggestions
        Returns: List of suggested goals with title, description, target, uom_type
        """
        client = self._get_client()
        if not client:
            return []
        
        try:
            thrust_context = f" focusing on {thrust_area}" if thrust_area else ""
            
            prompt = f"""You are an expert HR consultant helping employees set SMART goals.

Generate 5 specific, measurable, achievable, relevant, and time-bound goals for:
- Role: {role}
- Department: {department}{thrust_context}

For each goal, provide:
1. Title (concise, 5-8 words)
2. Description (detailed, 2-3 sentences explaining what and why)
3. Target (specific measurable target)
4. UoM Type (choose one: Numeric, Percentage, Timeline, or Zero)

Format your response as a JSON array with this structure:
[
  {{
    "title": "Goal title here",
    "description": "Detailed description here",
    "target": "Specific target value",
    "uom_type": "Numeric|Percentage|Timeline|Zero",
    "suggested_weightage": 20
  }}
]

Make goals realistic and aligned with typical {role} responsibilities in {department}.
Ensure suggested weightages total 100%."""

            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",  # Using GPT-3.5 via OpenRouter (uses free credit)
                messages=[
                    {"role": "system", "content": "You are an expert HR consultant specializing in goal setting and performance management."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Parse response
            content = response.choices[0].message.content
            
            # Try to extract JSON from response
            import json
            import re
            
            # Find JSON array in response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                goals = json.loads(json_match.group())
                return goals
            
            return []
        
        except Exception as e:
            print(f"Error generating AI suggestions: {e}")
            return []
    
    def improve_goal_description(self, title: str, description: str) -> str:
        """
        Use AI to improve goal description to make it more SMART
        """
        client = self._get_client()
        if not client:
            return description
        
        try:
            prompt = f"""Improve this goal description to make it more SMART (Specific, Measurable, Achievable, Relevant, Time-bound):

Title: {title}
Current Description: {description}

Provide an improved description that is clear, specific, and measurable. Keep it concise (2-3 sentences)."""

            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",  # Using GPT-3.5 via OpenRouter (uses free credit)
                messages=[
                    {"role": "system", "content": "You are an expert at writing SMART goals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            improved = response.choices[0].message.content.strip()
            return improved
        
        except Exception as e:
            print(f"Error improving description: {e}")
            return description
