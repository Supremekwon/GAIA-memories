import os
import uuid # This generates unique IDs
from flask import Flask, render_template, request, jsonify, session
from va_logic import get_bot_response

app = Flask(__name__)
# Keep this secret key so Flask can store the session ID in the user's browser
app.secret_key = os.urandom(24)

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/chat')
def chat():
    # Instead of clearing a list, we check if the user has a unique ID.
    # If they don't, we give them one that lasts as long as their browser is open.
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return render_template('index.html')

@app.route('/play')
def play():
    return render_template('play.html')

@app.route('/message', methods=['POST'])
def message():
    user_input = request.json.get('message')

    # 1. Grab the unique Session ID for this specific user
    # If it's missing for some reason, we generate a fallback one
    user_id = session.get('session_id', str(uuid.uuid4()))

    # 2. Get Gaia's response. 
    # Notice we now pass the 'user_id' instead of the 'history' list!
    response = get_bot_response(user_input, user_id)

    # 3. We no longer need to manually append history here! 
    # Your va_logic.py now saves everything to the gaia_vault.db automatically.

    return jsonify({'reply': response})

if __name__ == '__main__':
    app.run(debug=True)