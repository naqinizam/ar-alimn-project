from flask import Flask, render_template, jsonify, send_from_directory
import os

app = Flask(__name__)

# === HTML Page Routes ===
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/products")
def products():
    return render_template("products.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/ar")
def ar_demo():
    return render_template("ar.html")

# === AR Model Endpoint ===
@app.route("/get_model")
def get_model():
    chair_path = os.path.join(app.static_folder, 'images', 'chair.png')

    if not os.path.exists(chair_path):
        print(f"❌ Error: Chair image not found at {chair_path}")
        return jsonify({"error": "Chair image not found"}), 404
    else:
        print(f"✅ Chair image found at {chair_path}")

    return jsonify({"model_url": "/static/images/chair.png"})

# === Static File Handling ===
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# === Run App ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
