from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import os

# 1. Absolute Path Setup
# Get the directory where server.py is located (C:\dev\IRAV2)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Add the gemini folder to sys.path so we can import gemini_api
GEMINI_PATH = os.path.join(BASE_DIR, "src", "app", "api", "gemini")
sys.path.append(GEMINI_PATH)

from src.app.api.gemini.gemini_api import ask_gemini

app = FastAPI(title="IRA Voice Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask")
async def ask(data: dict):
    user_input = data.get("text", "")
    if not user_input:
        return {"success": False, "response": "No text provided"}
    
    try:
        result = ask_gemini(user_input)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    print(f"🚀 IRA Project Root: {BASE_DIR}")
    print("🚀 IRA Backend running on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)