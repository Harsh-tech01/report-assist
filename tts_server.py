from flask import Flask, request, send_file, jsonify
from gtts import gTTS
from googletrans import Translator
from pydub import AudioSegment
import os
import uuid
import threading
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
AUDIO_FOLDER = './audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

translator = Translator()

def chunk_text(text, max_chars=1000):
    """
    Original: Split text into chunks before translation
    """
    lines = text.split('\n')
    chunks, current = [], ""
    for line in lines:
        if len(current) + len(line) + 1 <= max_chars:
            current += line + "\n"
        else:
            chunks.append(current.strip())
            current = line + "\n"
    if current:
        chunks.append(current.strip())
    return chunks

def safe_chunk_for_tts(text, max_chars=500):
    """
    Split any text (post-translation) into gTTS-safe chunks (fallback for TTS).
    """
    chunks = []
    while len(text) > max_chars:
        cut_index = text.rfind(' ', 0, max_chars)
        if cut_index == -1:
            cut_index = max_chars
        chunks.append(text[:cut_index].strip())
        text = text[cut_index:].strip()
    if text:
        chunks.append(text.strip())
    return chunks

def manage_file_storage():
    files = sorted(
        [os.path.join(UPLOAD_FOLDER, f) for f in os.listdir(UPLOAD_FOLDER)],
        key=os.path.getmtime, reverse=True
    )
    for old_file in files[5:]:
        os.remove(old_file)

def cleanup_audio_folder(delay=5):
    def delete_files():
        time.sleep(delay)
        for f in os.listdir(AUDIO_FOLDER):
            path = os.path.join(AUDIO_FOLDER, f)
            try:
                if os.path.isfile(path) and path.endswith(".mp3"):
                    os.remove(path)
            except Exception as e:
                print(f"Failed to delete {path}: {e}")
    threading.Thread(target=delete_files).start()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Invalid file"}), 400

    filename = file.filename.strip()
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    manage_file_storage()
    return jsonify({"message": "File uploaded successfully", "filename": filename})

@app.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.get_json()
    text = data.get("text", "")
    target_lang = data.get("languageCode", "en")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    try:
        pre_chunks = chunk_text(text, max_chars=1000)
        translated_chunks = [
            translator.translate(chunk, dest=target_lang).text
            for chunk in pre_chunks
        ]
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

    try:
        audio_chunks = []
        for t_chunk in translated_chunks:
            for safe_chunk in safe_chunk_for_tts(t_chunk, max_chars=500):
                if not safe_chunk.strip():
                    continue
                try:
                    temp_filename = f"{uuid.uuid4()}.mp3"
                    temp_path = os.path.join(AUDIO_FOLDER, temp_filename)
                    gTTS(text=safe_chunk, lang=target_lang).save(temp_path)
                    audio_chunks.append(temp_path)
                except Exception as tts_error:
                    print(f"[WARN] gTTS failed on chunk: {tts_error}")

        if not audio_chunks:
            return jsonify({"error": "No audio could be generated"}), 500

        combined = AudioSegment.empty()
        for path in audio_chunks:
            combined += AudioSegment.from_file(path, format="mp3")

        final_filename = f"{uuid.uuid4()}.mp3"
        final_path = os.path.join(AUDIO_FOLDER, final_filename)
        combined.export(final_path, format="mp3")

        for path in audio_chunks:
            os.remove(path)

        cleanup_audio_folder()

        return send_file(final_path, mimetype="audio/mpeg", as_attachment=True, download_name=final_filename)

    except Exception as e:
        return jsonify({"error": f"TTS failed: {str(e)}"}), 500

@app.route("/", methods=["GET"])
def index():
    return "✅ TTS Server is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)