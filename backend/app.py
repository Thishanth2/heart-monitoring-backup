from flask import Flask, request, jsonify
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

latest_sensor_data = {}

if not firebase_admin._apps:
    cred = credentials.Certificate(
        r"d:\heart-monitoring-backup\backend\serviceAccountKey.json"
    )
    firebase_admin.initialize_app(cred)

db = firestore.client()


@app.route("/", methods=["GET"])
def home():
    return "Backend running"


@app.route("/api/sensor", methods=["POST"])
def sensor_data():
    global latest_sensor_data

    try:
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "error": "No sensor data received"
            }), 400

        latest_sensor_data = data

        # Save ONLY final MAX30102 reading to Firebase
        if data.get("measurementStatus") == "completed":
            save_data = data.copy()
            save_data.pop("thermalPixels", None)
            save_data["createdAt"] = firestore.SERVER_TIMESTAMP

            db.collection("sensor_readings").add(save_data)

        return jsonify({
            "success": True,
            "message": "Live data received"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/latest-sensor", methods=["GET"])
def latest_sensor():
    return jsonify(latest_sensor_data), 200


@app.route("/api/thermal-result", methods=["POST"])
def thermal_result():
    try:
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "error": "No thermal result received"
            }), 400

        data["createdAt"] = firestore.SERVER_TIMESTAMP

        # Save ONLY final ROI result to Firebase
        db.collection("thermal_results").add(data)

        return jsonify({
            "success": True,
            "message": "Thermal result saved"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )