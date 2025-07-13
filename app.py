from flask import Flask, render_template, jsonify, send_from_directory
import os

app = Flask(__name__)

# === Page Routes ===
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

# === API Route for AR Model Image ===
@app.route("/get_model")
def get_model():
    chair_path = os.path.join(app.static_folder, 'images', 'chair.png')

    if not os.path.exists(chair_path):
        print(f"❌ Error: Chair image not found at {chair_path}")
    else:
        print(f"✅ Chair image found at {chair_path}")

    return jsonify({"model_url": "/static/images/chair.png"})

# === Static Files Route (optional if using Flask's built-in static serving) ===
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# === Start the server ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
