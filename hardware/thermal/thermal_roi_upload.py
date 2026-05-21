import serial
import numpy as np
import matplotlib.pyplot as plt
import requests
import datetime
import os
import cv2
from matplotlib.patches import Ellipse, Rectangle

# ============================================
# SETTINGS
# ============================================

SERIAL_PORT = "COM4"      # Change this to your Pico COM port
BAUD_RATE = 115200

BACKEND_FRAME_URL = "http://127.0.0.1:5000/api/thermal-frame"
BACKEND_RESULT_URL = "http://127.0.0.1:5000/api/thermal-result"

SAVE_FOLDER = "saved_thermal_images"
DISPLAY_SIZE = 400
GRID_SIZE = 8
ROI_RADIUS = 1

os.makedirs(SAVE_FOLDER, exist_ok=True)

# ============================================
# SERIAL
# ============================================

print("Opening serial port...")
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
print("Serial connected")

# ============================================
# MATPLOTLIB WINDOW
# ============================================

plt.ion()

fig, ax = plt.subplots(figsize=(8, 8))

thermal_image = np.zeros((DISPLAY_SIZE, DISPLAY_SIZE), dtype=np.float32)

heatmap = ax.imshow(
    thermal_image,
    cmap="inferno",
    interpolation="nearest"
)

plt.colorbar(heatmap, ax=ax)

ax.set_title("AMG8833 Live Thermal Camera")

scale = DISPLAY_SIZE / GRID_SIZE

# ============================================
# GUIDE OVERLAY
# ============================================

finger_positions = [95, 165, 235, 305]

for x in finger_positions:
    finger = Ellipse(
        (x, 105),
        width=45,
        height=155,
        edgecolor="white",
        facecolor="none",
        linewidth=2,
        linestyle="--"
    )
    ax.add_patch(finger)

palm_box = Rectangle(
    (65, 235),
    270,
    110,
    edgecolor="cyan",
    facecolor="none",
    linewidth=2,
    linestyle="--"
)
ax.add_patch(palm_box)

instruction_text = ax.text(
    10,
    375,
    "Place 4 fingers inside white outlines\nClick 1: Fingertip ROI | Click 2: Palm/Bottom ROI",
    color="white",
    fontsize=10,
    weight="bold",
    bbox=dict(facecolor="black", alpha=0.7)
)

result_text = ax.text(
    10,
    20,
    "Waiting for thermal CSV data...",
    color="white",
    fontsize=11,
    weight="bold",
    bbox=dict(facecolor="black", alpha=0.7)
)

# ============================================
# ROI VARIABLES
# ============================================

roi_points = []
roi_markers = []
roi_rectangles = []
saved_once = False
sent_result_once = False

# ============================================
# HELPER FUNCTIONS
# ============================================

def clamp(value, low, high):
    return max(low, min(high, value))


def get_roi_average_from_pixels(pixels_8x8, display_x, display_y):
    col = int(display_x / scale)
    row = int(display_y / scale)

    row = clamp(row, 0, GRID_SIZE - 1)
    col = clamp(col, 0, GRID_SIZE - 1)

    r1 = clamp(row - ROI_RADIUS, 0, GRID_SIZE - 1)
    r2 = clamp(row + ROI_RADIUS, 0, GRID_SIZE - 1)
    c1 = clamp(col - ROI_RADIUS, 0, GRID_SIZE - 1)
    c2 = clamp(col + ROI_RADIUS, 0, GRID_SIZE - 1)

    roi = pixels_8x8[r1:r2 + 1, c1:c2 + 1]

    return float(np.mean(roi)), row, col, r1, r2, c1, c2


def draw_roi_rectangle(r1, r2, c1, c2, color):
    x = c1 * scale
    y = r1 * scale
    w = (c2 - c1 + 1) * scale
    h = (r2 - r1 + 1) * scale

    rect = Rectangle(
        (x, y),
        w,
        h,
        edgecolor=color,
        facecolor="none",
        linewidth=2
    )

    ax.add_patch(rect)
    roi_rectangles.append(rect)


def clear_roi_drawings():
    global roi_markers, roi_rectangles

    for marker in roi_markers:
        marker.remove()

    for rect in roi_rectangles:
        rect.remove()

    roi_markers = []
    roi_rectangles = []


def get_circulation_status(delta_t):
    if delta_t <= 1.5:
        return "Good circulation"
    elif delta_t <= 3.0:
        return "Moderate circulation"
    else:
        return "Possible poor circulation"


def send_frame_to_backend(pixels_8x8):
    payload = {
        "pixels": [float(v) for v in pixels_8x8.flatten()],
        "minTemp": round(float(np.min(pixels_8x8)), 2),
        "maxTemp": round(float(np.max(pixels_8x8)), 2),
        "avgTemp": round(float(np.mean(pixels_8x8)), 2)
    }

    try:
        requests.post(
            BACKEND_FRAME_URL,
            json=payload,
            timeout=0.2
        )
    except:
        pass


def send_result_to_backend(fingertip_temp, palm_temp, delta_t, image_path):
    payload = {
        "fingertipTemp": round(float(fingertip_temp), 2),
        "palmTemp": round(float(palm_temp), 2),
        "deltaT": round(float(delta_t), 2),
        "circulationStatus": get_circulation_status(delta_t),
        "imagePath": image_path
    }

    try:
        response = requests.post(
            BACKEND_RESULT_URL,
            json=payload
        )

        print("Backend Thermal Result:", response.text)

    except Exception as e:
        print("Backend Thermal Upload Error:", e)


# latest real 8x8 values
latest_pixels = None

# ============================================
# CLICK EVENT
# ============================================

def onclick(event):
    global roi_points, saved_once, sent_result_once

    if event.xdata is None or event.ydata is None:
        return

    if latest_pixels is None:
        print("No thermal frame yet")
        return

    x = int(event.xdata)
    y = int(event.ydata)

    if len(roi_points) >= 2:
        roi_points = []
        clear_roi_drawings()
        saved_once = False
        sent_result_once = False

    roi_points.append((x, y))

    if len(roi_points) == 1:
        marker, = ax.plot(x, y, "wo", markersize=8, markeredgecolor="black")
        roi_markers.append(marker)
        result_text.set_text("Fingertip ROI selected\nNow click Palm/Bottom ROI")
        print("Fingertip ROI selected:", x, y)

    elif len(roi_points) == 2:
        marker, = ax.plot(x, y, "co", markersize=8, markeredgecolor="black")
        roi_markers.append(marker)
        print("Palm/Bottom ROI selected:", x, y)
        process_roi()

    fig.canvas.draw()


fig.canvas.mpl_connect("button_press_event", onclick)

# ============================================
# PROCESS ROI
# ============================================

def process_roi():
    global saved_once, sent_result_once

    if latest_pixels is None:
        return

    if len(roi_points) < 2:
        return

    fingertip_x, fingertip_y = roi_points[0]
    palm_x, palm_y = roi_points[1]

    fingertip_temp, tr, tc, r1, r2, c1, c2 = get_roi_average_from_pixels(
        latest_pixels,
        fingertip_x,
        fingertip_y
    )

    draw_roi_rectangle(r1, r2, c1, c2, "white")

    palm_temp, pr, pc, r1, r2, c1, c2 = get_roi_average_from_pixels(
        latest_pixels,
        palm_x,
        palm_y
    )

    draw_roi_rectangle(r1, r2, c1, c2, "cyan")

    delta_t = palm_temp - fingertip_temp
    circulation = get_circulation_status(delta_t)

    result_text.set_text(
        f"Fingertip Avg: {fingertip_temp:.2f} C\n"
        f"Palm Avg: {palm_temp:.2f} C\n"
        f"Delta T: {delta_t:.2f} C\n"
        f"{circulation}"
    )

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    image_path = os.path.join(
        SAVE_FOLDER,
        f"thermal_{timestamp}.png"
    )

    if not saved_once:
        plt.savefig(image_path, dpi=150, bbox_inches="tight")

        print("====================================")
        print("THERMAL ROI RESULT")
        print("Fingertip Temp :", round(float(fingertip_temp), 2))
        print("Palm Temp      :", round(float(palm_temp), 2))
        print("Delta T        :", round(float(delta_t), 2))
        print("Status         :", circulation)
        print("Image Saved    :", image_path)
        print("====================================")

        saved_once = True

    if saved_once and not sent_result_once:
        send_result_to_backend(
            fingertip_temp,
            palm_temp,
            delta_t,
            image_path
        )
        sent_result_once = True


# ============================================
# MAIN LOOP
# ============================================

while True:
    try:
        line = ser.readline().decode(errors="ignore").strip()

        if not line.startswith("CSV:"):
            plt.pause(0.01)
            continue

        values = line.replace("CSV:", "").split(",")

        if len(values) != 64:
            plt.pause(0.01)
            continue

        pixels_8x8 = np.array(
            [float(v) for v in values],
            dtype=np.float32
        ).reshape((8, 8))

        latest_pixels = pixels_8x8

        thermal_image = cv2.resize(
            pixels_8x8,
            (DISPLAY_SIZE, DISPLAY_SIZE),
            interpolation=cv2.INTER_CUBIC
        )

        thermal_image = cv2.GaussianBlur(
            thermal_image,
            (7, 7),
            0
        )

        heatmap.set_data(thermal_image)

        heatmap.set_clim(
            np.min(thermal_image),
            np.max(thermal_image)
        )

        ax.set_title(
            f"AMG8833 Live Thermal Camera | Min: {np.min(pixels_8x8):.2f} C | Max: {np.max(pixels_8x8):.2f} C"
        )

        send_frame_to_backend(pixels_8x8)

        fig.canvas.draw()
        fig.canvas.flush_events()

    except Exception as e:
        print("Thermal Error:", e)