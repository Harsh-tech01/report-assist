from flask import Flask, request, send_file, jsonify
from gtts import gTTS
import os
import uuid

app = Flask(__name__)

# Ensure 'audio' folder exists
AUDIO_FOLDER = './audio'
os.makedirs(AUDIO_FOLDER, exist_ok=True)

from flask_cors import CORS
CORS(app)
@app.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.get_json()
    text = data.get("text", "")
    lang = data.get("languageCode", "en")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join("output", filename)

    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(filepath)
        return send_file(filepath, mimetype="audio/mpeg", as_attachment=True, download_name=filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
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
    os.makedirs("output", exist_ok=True)
    app.run(host="0.0.0.0", port=5001)
