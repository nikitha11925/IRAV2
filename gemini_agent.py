import google.generativeai as genai
from google.api_core import retry
import os
import traceback

# Import ALL our new tools!
from database_manager import modify_inventory, locate_item, transfer_item, report_system_hazard, add_system_log

try:
    with open('gemini-key.txt', 'r') as key_file:
        api_key = key_file.read().strip()
        genai.configure(api_key=api_key)
except Exception as e:
    print(f"Key Error: {e}")

# Add the new tools to Gemini's toolbox
tools = [modify_inventory, locate_item, transfer_item, report_system_hazard]

try:
    agent = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        tools=tools,
        system_instruction=(
            "You are IRA (Intelligent Routing Assistant), an advanced AI for a logistics warehouse. "
            "You receive voice transcripts from warehouse staff. "
            "RULES: "
            "1. To add or remove units of an item, use `modify_inventory`. "
            "2. To find where an item is, use `locate_item`. "
            "3. To move an item to a new shelf/location, use `transfer_item`. "
            "4. If a user reports a spill, danger, or delay, use `report_system_hazard` to alert the dashboard. "
            "5. After successfully using a tool, formulate a highly specific, professional spoken response confirming exactly what was changed or found in the database. DO NOT say 'got it'. "
        )
    )
except Exception as init_error:
    print(f"Agent Init Error: {init_error}")

def process_voice_command(user_text: str, user_name: str, user_role: str) -> dict:
    try:
        chat = agent.start_chat(enable_automatic_function_calling=True)
        prompt = f"User '{user_name}' (Role: {user_role}) said: '{user_text}'"
        
        response = chat.send_message(prompt, request_options={'retry': retry.Retry()})
        final_text = response.text.strip()
        
        # Simple intent categorization for the UI
        intent_category = "GENERAL_TASK"
        if "locate" in user_text.lower() or "where" in user_text.lower(): intent_category = "LOCATE_ITEM"
        elif "spill" in user_text.lower() or "hazard" in user_text.lower(): intent_category = "REPORT_HAZARD"
        elif "move" in user_text.lower() or "transfer" in user_text.lower(): intent_category = "TRANSFER_ITEM"
        elif "add" in user_text.lower() or "remove" in user_text.lower(): intent_category = "INVENTORY_UPDATE"
        
        # Log it
        add_system_log(user_name, user_role, intent_category, final_text, user_text)
        
        return {
            "intent": intent_category,
            "response": final_text
        }
        
    except Exception as e:
        exact_error = str(e)
        if "ResourceExhausted" in exact_error or "Quota exceeded" in exact_error:
             return {
                "intent": "RATE_LIMIT",
                "response": "I am receiving too many requests. Please wait a few seconds and try again."
            }

        full_traceback = traceback.format_exc()
        print("====== REAL ERROR ======")
        print(full_traceback)
        print("========================")
        
        return {
            "intent": "CRASH_REPORT",
            "response": f"System error: {exact_error}. Check the backend terminal."
        }