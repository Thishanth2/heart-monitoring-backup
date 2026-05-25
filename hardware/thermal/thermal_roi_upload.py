import serial
import requests
import time

SERIAL_PORT = "COM4"
BAUD_RATE = 115200

BACKEND_URL = "http://127.0.0.1:5000/api/thermal-frame"

print("Opening serial port...")
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
print("Serial connected")

while True:
    try:
        line = ser.readline().decode("utf-8", errors="ignore").strip()

        if not line.startswith("CSV:"):
            continue

        values = line.replace("CSV:", "").split(",")

        if len(values) != 64:
            continue

        pixels = [float(v) for v in values]

        payload = {
            "pixels": pixels,
            "minTemp": round(min(pixels), 2),
            "maxTemp": round(max(pixels), 2),
            "avgTemp": round(sum(pixels) / len(pixels), 2)
        }

        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=1
        )

        print("Thermal frame sent:", response.status_code)

        time.sleep(0.1)

    except Exception as e:
        print("Thermal bridge error:", e)
        time.sleep(0.5)