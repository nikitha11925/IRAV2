from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gemini_agent import process_voice_command

app = FastAPI()

# Enable CORS so your React frontend running on Vite (usually port 5173) can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your actual frontend URL!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define what data the React frontend needs to send us
class VoiceRequest(BaseModel):
    text: str
    user_name: str
    user_role: str

@app.post("/ask")
async def ask_ira(request: VoiceRequest):
    try:
        print(f"Received command from {request.user_name}: {request.text}")
        
        # Pass the transcript and user context to our new Agent
        result = process_voice_command(
            user_text=request.text, 
            user_name=request.user_name, 
            user_role=request.user_role
        )
        
        # Return the AI's intent and formatted response back to React
        return result
        
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command")

if __name__ == "__main__":
    import uvicorn
    # Runs the server on localhost:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)