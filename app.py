from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder="client/build", static_url_path="")

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# Example API endpoint (replace/add your real endpoints here)
@app.route('/api/hello')
def hello():
    return jsonify({"msg": "Hello from Flask!"})

if __name__ == "__main__":
    app.run(debug=True)
