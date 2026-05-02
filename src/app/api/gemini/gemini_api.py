import os
import json
from google import genai
from google.genai import types

# 1. Look for the key relative to this file's location
# This goes up 4 levels: gemini/ -> api/ -> app/ -> src/ -> IRAV2/
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../../../"))
KEY_FILE = os.path.join(BASE_DIR, "gemini-key.txt")

def get_api_key():
    try:
        with open(KEY_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"❌ Key file not found! Looked at: {KEY_FILE}")
        # Fallback to env variable if file fails
        return os.getenv("GEMINI_API_KEY")

GEMINI_API_KEY = get_api_key()

if not GEMINI_API_KEY:
    raise Exception("API Key missing. Add gemini-key.txt to project root.")

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = "You are IRA, a warehouse assistant. Keep responses to 1-2 sentences. Use JSON."

def ask_gemini(user_text: str):
    # Fixed model name to gemini-1.5-flash for reliability
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=user_text,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.1,
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "intent": {"type": "string"},
                    "response": {"type": "string"},
                    "action_data": {"type": "object"}
                },
                "required": ["intent", "response"]
            }
        )
    )
    return json.loads(response.text)