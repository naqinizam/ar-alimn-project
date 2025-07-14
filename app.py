from flask import Flask, render_template, jsonify, send_from_directory, url_for, request
import os

app = Flask(__name__)

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

@app.route("/get_model")
def get_model():
    item = request.args.get("item", "chair")
    filename = f"{item}.png"
    model_path = os.path.join(app.static_folder, 'images', filename)

    if not os.path.exists(model_path):
        print(f"❌ {filename} not found. Falling back to chair.png")
        filename = "chair.png"
    else:
        print(f"✅ Loaded model: {filename}")

    return jsonify({"model_url": url_for('static', filename=f'images/{filename}')})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=10000)
