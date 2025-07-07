from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_model")
def get_model():
    # Return the placeholder image path (replace with 3D model later)
    return jsonify({"model_url": "/static/images/chair.png"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)  # Render requires explicit host/port