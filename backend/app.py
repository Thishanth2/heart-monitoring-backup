from flask import Flask, request, jsonify
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

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
    try:
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "error": "No sensor data received"
            }), 400

        data["createdAt"] = firestore.SERVER_TIMESTAMP

        db.collection("sensor_readings").add(data)

        return jsonify({
            "success": True,
            "message": "Sensor data saved"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/thermal-frame", methods=["POST"])
def thermal_frame():
    try:
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "error": "No thermal frame received"
            }), 400

        data["createdAt"] = firestore.SERVER_TIMESTAMP

        db.collection("thermal_frames").add(data)

        return jsonify({
            "success": True,
            "message": "Thermal frame saved"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


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