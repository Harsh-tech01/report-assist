from flask import Flask, request, send_file, jsonify
from gtts import gTTS
from googletrans import Translator
import os
import uuid

app = Flask(__name__)

# Ensure 'audio' folder exists
AUDIO_FOLDER = './audio'
os.makedirs(AUDIO_FOLDER, exist_ok=True)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

from flask_cors import CORS
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Invalid file"}), 400

    # Generate unique filename and save file
    filename = file.filename.strip()  # Removes accidental whitespace issues
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)  # Saves the exact file as uploaded

    # Maintain only the latest 5 files
    manage_file_storage()

    return jsonify({"message": "File uploaded successfully", "filename": filename})

def manage_file_storage():
    """Keeps only the latest 5 files, deletes older ones."""
    files = sorted(
        [os.path.join(UPLOAD_FOLDER, f) for f in os.listdir(UPLOAD_FOLDER)],
        key=os.path.getmtime,  # Sort by modification time (latest first)
        reverse=True
    )

    if len(files) > 5:
        for old_file in files[5:]:  # Remove files beyond latest 5
            os.remove(old_file)

        
translator = Translator()

@app.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.get_json()
    text = data.get("text", "")
    target_lang = data.get("languageCode", "en")  # Default to English

    if not text:
        return jsonify({"error": "Text is required"}), 400

    # Translate text before synthesis
    try:
        translated_text = translator.translate(text, dest=target_lang).text
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(AUDIO_FOLDER, filename)

    try:
        tts = gTTS(text=translated_text, lang=target_lang)
        tts.save(filepath)
        return send_file(filepath, mimetype="audio/mpeg", as_attachment=True, download_name=filename)
    except Exception as e:
        return jsonify({"error": f"TTS failed: {str(e)}"}), 500
    finally:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as cleanup_error:
            print(f"Error cleaning up audio file: {cleanup_error}")

@app.route("/", methods=["GET"])
def index():
    return "✅ TTS Server is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
