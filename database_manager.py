import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.getcwd(), 'src', 'data', 'database.json')

def load_db():
    try:
        with open(DB_PATH, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: Could not find database at {DB_PATH}")
        return None

def save_db(data):
    with open(DB_PATH, 'w') as file:
        json.dump(data, file, indent=2)

def clean_code(item_code: str) -> str:
    """Helper to fix voice transcription errors like 'A 12' -> 'A12'"""
    return item_code.replace(" ", "").upper()

def modify_inventory(item_code: str, quantity: int, action: str) -> str:
    """Called by Gemini to add or remove stock quantities."""
    db = load_db()
    if not db: return "Database connection failed."

    target_code = clean_code(item_code)
    for item in db.get('inventory', []):
        if item['item'].upper() == target_code:
            if action == 'add':
                item['quantity'] += quantity
            elif action == 'remove':
                item['quantity'] = max(0, item['quantity'] - quantity)
            else:
                return f"Invalid action. Must be 'add' or 'remove'."

            # Auto-update status
            if item['quantity'] == 0: item['status'] = 'critical'
            elif item['quantity'] < 20: item['status'] = 'low_stock'
            else: item['status'] = 'available'
            
            save_db(db)
            action_word = "Added" if action == "add" else "Removed"
            return f"Success: {action_word} {quantity} units. {target_code} now has {item['quantity']} in stock at {item['location']}."

    return f"Failed: Item {target_code} does not exist in inventory."

def locate_item(item_code: str) -> str:
    """Called by Gemini to find an item's location and stock level."""
    db = load_db()
    if not db: return "Database connection failed."
    
    target_code = clean_code(item_code)
    for item in db.get('inventory', []):
        if item['item'].upper() == target_code:
            return f"Item {target_code} is currently located at {item['location']} with a quantity of {item['quantity']}."
    return f"I could not find item {target_code} in the database."

def transfer_item(item_code: str, new_location: str) -> str:
    """Called by Gemini to move an item to a different shelf, rack, or bay."""
    db = load_db()
    if not db: return "Database connection failed."
    
    target_code = clean_code(item_code)
    for item in db.get('inventory', []):
        if item['item'].upper() == target_code:
            old_location = item['location']
            item['location'] = new_location
            save_db(db)
            return f"Success: Item {target_code} has been moved from {old_location} to {new_location}."
    return f"Failed: Item {target_code} does not exist."

def report_system_hazard(severity: str, message: str, reported_by: str) -> str:
    """Called by Gemini to log a safety hazard to the active alerts dashboard. Severity must be 'high', 'medium', or 'critical'."""
    db = load_db()
    if not db: return "Database connection failed."

    new_id = 1 if not db.get('alerts') else db['alerts'][-1]['id'] + 1
    
    new_alert = {
        "id": new_id,
        "type": "hazard",
        "severity": severity.lower(),
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "status": "active",
        "reportedBy": reported_by
    }

    if 'alerts' not in db: db['alerts'] = []
    db['alerts'].insert(0, new_alert) # Add to top of list
    save_db(db)
    
    return f"Hazard successfully reported to the system with {severity} severity."

def add_system_log(user_name: str, user_role: str, action_intent: str, details: str, voice_input: str):
    """Internal function to log actions."""
    db = load_db()
    if not db: return

    new_id = 1 if not db.get('logs') else db['logs'][-1]['id'] + 1
    new_log = {
        "id": new_id,
        "timestamp": datetime.now().isoformat(),
        "user": user_name,
        "role": user_role,
        "action": action_intent.upper(),
        "details": details,
        "voiceInput": voice_input
    }

    if 'logs' not in db: db['logs'] = []
    db['logs'].append(new_log)
    save_db(db)