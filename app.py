from flask import Flask, render_template, jsonify, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

# Explicitly serve the chair image
@app.route("/get_model")
def get_model():
    import os
    chair_path = os.path.join(app.static_folder, 'images', 'chair.png')
    
    # Debug: Check if file exists
    if not os.path.exists(chair_path):
        print(f"❌ Error: Chair image not found at {chair_path}")
    else:
        print(f"✅ Chair image found at {chair_path}")
    
    return jsonify({"model_url": "/static/images/chair.png"})

# Required to serve static files on Render
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)