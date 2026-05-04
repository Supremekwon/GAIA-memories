import os
import sqlite3
import json
from openai import OpenAI

# --- CONFIGURATION ---
# The professional way to handle keys: Retrieve from environment variables.
# For local use, ensure you have an .env file or the variable set in your terminal.
API_KEY = os.environ.get("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY, 
)

# --- DATABASE LOGIC (The Memory Vault) ---
DB_FILE = "gaia_vault.db"

def init_db():
    """Creates the database file and table if they don't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS chat_sessions 
                     (session_id TEXT PRIMARY KEY, history TEXT)''')
    conn.commit()
    conn.close()

def get_chat_history(session_id):
    """Retrieves the specific memory notebook for a user."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT history FROM chat_sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return json.loads(row[0]) if row else []

def save_chat_history(session_id, history):
    """Saves the updated conversation back to the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    json_history = json.dumps(history)
    cursor.execute("INSERT OR REPLACE INTO chat_sessions (session_id, history) VALUES (?, ?)", 
                   (session_id, json_history))
    conn.commit()
    conn.close()

# Initialize the database immediately upon module load
init_db()

# --- BRAIN LOGIC ---

def get_system_prompt():
    """
    GAIA's Core Personality. 
    Matches your goal of a real-time gaming companion for GTA 5, RDR2, and Cyberpunk.
    """
    return {
        "role": "system",
        "content": (
            "You are GAIA, a real-time gaming companion and business expert. "
            "Expertise: GTA 5, Red Dead Redemption 2, Cyberpunk 2077, and No Man's Sky. "
            "Tone: Witty, helpful, and insightful. Give hints before full solutions. "
            "Stay in character as a gaming assistant. Never claim to be human."
        )
    }

def get_bot_response(user_message, session_id):
    """
    Handles AI orchestration with persistent SQLite memory.
    """
    try:
        # 1. Pull this specific user's memories from the Vault
        chat_history = get_chat_history(session_id)

        # 2. Build the messages for the AI
        messages = [get_system_prompt()]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        # 3. Request response from OpenRouter
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=messages,
            temperature=0.8,
            max_tokens=300,
            extra_headers={
                "HTTP-Referer": "http://localhost:5000", 
                "X-Title": "GAIA Gaming Assistant",
            }
        )

        bot_answer = response.choices[0].message.content

        # 4. Update the history and save it to the database
        chat_history.append({"role": "user", "content": user_message})
        chat_history.append({"role": "assistant", "content": bot_answer})
        
        # Save only the last 20 messages to prevent context bloat
        save_chat_history(session_id, chat_history[-20:])

        return bot_answer

    except Exception as e:
        print(f"ERROR: {e}")
        return "System failure: Connection to the gaming network is down."