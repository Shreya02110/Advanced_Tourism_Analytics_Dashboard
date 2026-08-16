from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Serve the Frontend folder as static assets
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Frontend'))

@app.route('/')
def index():
    return send_from_directory(os.path.join(FRONTEND_DIR), 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # Serve any file from the Frontend folder (js/css/images)
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == '__main__':
    app.run(debug=True, port=5001)

