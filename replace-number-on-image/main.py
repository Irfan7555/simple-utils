from easyocr import Reader
import cv2
import numpy as np
import time
import re

# Load image
image = cv2.imread("input/phone-number.png")
output = image.copy()

reader = Reader(['en'], gpu=False)

print("Running OCR...")
ts = time.time()
results = reader.readtext(image)
te = time.time()
print(f"OCR completed in {te - ts:.2f}s\n")

TARGET_TEXT = input("Enter a target text: ")

for bbox, text, confidence in results:
    # Detect numeric text (at least 3 digits)
    if re.search(r"\d{3}", text):

        pts = np.array(bbox, dtype=np.int32)
        x, y, w, h = cv2.boundingRect(pts)

        print(f"Replacing: {text} at x={x}, y={y}")


        h_margin = int(h * 0.1)  # 10% margin
        w_margin = int(w * 0.1)

        samples = []


        points_to_sample = [
            (max(x - 5, 0), max(y - 5, 0)),  # Top-Left
            (min(x + w + 5, image.shape[1] - 1), max(y - 5, 0)),  # Top-Right
            (max(x - 5, 0), min(y + h + 5, image.shape[0] - 1)),  # Bottom-Left
            (min(x + w + 5, image.shape[1] - 1), min(y + h + 5, image.shape[0] - 1))  # Bottom-Right
        ]

        for px, py in points_to_sample:
            samples.append(image[py, px])


        bg_color = np.median(np.array(samples), axis=0).astype(int).tolist()


        dilation = 2
        cv2.rectangle(
            output,
            (x - dilation, y - dilation),
            (x + w + dilation, y + h + dilation),
            bg_color,
            thickness=-1
        )

        # 2️⃣ Draw new text
        font_scale = h / 30
        thickness = max(1, int(font_scale * 2))

        (tw, th), _ = cv2.getTextSize(
            TARGET_TEXT,
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            thickness
        )

        # Center the text
        tx = x + (w - tw) // 2
        ty = y + (h + th) // 2

        cv2.putText(
            output,
            TARGET_TEXT,
            (tx, ty),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 0, 0),  # Text color (Black)
            thickness,
            cv2.LINE_AA
        )

cv2.imwrite("output.jpg", output)
print("Saved output.jpg")