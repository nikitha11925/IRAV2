
  # Voice Logistics App Prototype

IRA (Intelligent Routing Assistant) is a bilingual, voice-activated logistics and warehouse management system. Designed for a high-paced warehouse environment, it allows staff to manage inventory, locate items, and report safety hazards using simple voice commands in either English or Hindi.

  This is a code bundle for Voice Logistics App Prototype. The original project is available at https://www.figma.com/design/JPt92I5o175mLLqaKbLn00/Voice-Logistics-App-Prototype.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  

Core Features
Bilingual Voice Control: Seamlessly switch between English and Hindi for all commands.

Automated Inventory Management: Add, remove, or transfer items (e.g., "Add 10 units to 1001" or "Move 1002 to Shelf 3") via voice.

Smart Item Localization: Instantly find which shelf or bay an item is located in.

Safety Hazard Reporting: Report spills or emergencies (e.g., "इरा, यहाँ तेल गिरा है") to trigger immediate dashboard alerts.

Real-time Dashboard: A React-based interface that visually reflects inventory changes, system logs, and active alerts.

Tech Stack
Frontend: React, Tailwind CSS, Lucide React (Icons), Web Speech API.

Backend: FastAPI (Python), Google Gemini 1.5 Flash.

Database: JSON-based local storage for rapid prototyping and persistent logging.

Installation & Setup
1. Backend Setup
Navigate to the root directory.

Install required Python packages:

Bash
pip install fastapi uvicorn google-generativeai

3.  Add your Google Gemini API key to a file named `gemini-key.txt` in the root folder.
4.  Start the FastAPI server:
    ```bash
    python server.py
    ```

#### **2. Frontend Setup**
1.  Navigate to the frontend directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the dashboard:
    ```bash
    npm run dev
    ```

---

### **Usage Guide**
1.  Open the dashboard and click the **Microphone** icon.
2.  Speak a command starting with the wake word **"Hello Ira"** or **"नमस्ते इरा"**.
    *   *Example:* "Hello Ira, move 1001 to Shelf 4."
    *   *Example:* "इरा, आइटम 1005 कहाँ है?"
3.  The system will process the intent, update the `database.json` file, and respond with a voice confirmation.

---

### **System Architecture**
The system uses a **Tool-Use (Agentic)** pattern. When a voice command is received, the Gemini 1.5 Flash model analyzes the intent and determines if a specific database tool (like `modify_inventory`) needs to be executed to fulfill the request.

---

### **Developer Information**
*   **Developer:** Nikitha D
*   **Institution:** Dayananda Sagar University (DSU)
*   **Major:** Computer Science and Engineering

<img width="439" height="851" alt="image" src="https://github.com/user-attachments/assets/f6c295a8-d758-4bde-a3c4-c09e9f33114b" />
<img width="439" height="850" alt="image" src="https://github.com/user-attachments/assets/42ffcdec-89da-4eed-bf8e-5b70b2cbd918" />
<img width="437" height="845" alt="image" src="https://github.com/user-attachments/assets/efe8d978-c35a-4f9f-98d3-328e4e8b6388" />
<img width="435" height="846" alt="image" src="https://github.com/user-attachments/assets/4cc8507b-cbec-4400-a411-c0ff385ada08" />
<img width="438" height="845" alt="image" src="https://github.com/user-attachments/assets/0f7907aa-4ee1-4654-a853-0fc6259e6c5e" />

  
