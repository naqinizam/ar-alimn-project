from flask import Flask, render_template, jsonify, send_from_directory, url_for
import os

app = Flask(__name__)

# === ROUTES FOR PAGES ===
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

# === API ROUTE TO SERVE AR MODEL ===
@app.route("/get_model")
def get_model():
    model_path = os.path.join(app.static_folder, 'images', 'chair.png')
    if not os.path.exists(model_path):
        print(f"❌ Chair model not found at {model_path}")
    else:
        print(f"✅ Chair model found: {model_path}")
    return jsonify({"model_url": url_for('static', filename='images/chair.png')})

# === OPTIONAL: SERVE STATIC FILES (Flask already handles this) ===
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# === RUN SERVER ===
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=10000)
