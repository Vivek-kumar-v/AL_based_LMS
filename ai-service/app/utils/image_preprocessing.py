import cv2
import numpy as np
from PIL import Image
import io


def pil_to_cv2(pil_img: Image.Image):
    """Convert PIL image to OpenCV format"""
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def cv2_to_pil(cv_img):
    """Convert OpenCV image to PIL format"""
    rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def remove_alpha_channel(pil_img: Image.Image):
    """9. Transparency / Alpha Channel"""
    if pil_img.mode in ("RGBA", "LA"):
        background = Image.new("RGB", pil_img.size, (255, 255, 255))
        background.paste(pil_img, mask=pil_img.split()[-1])
        return background
    return pil_img.convert("RGB")


def preprocess_image_for_ocr(image_bytes: bytes):
    """
    Full OCR preprocessing pipeline:
    1. Inverted Images
    2. Rescaling
    3. Binarization
    4. Noise Removal
    5. Dilation and Erosion
    6. Rotation / Deskewing
    7. Removing Borders
    8. Missing Borders
    9. Transparency / Alpha Channel
    """

    # Load image
    pil_img = Image.open(io.BytesIO(image_bytes))

    # 9. Transparency
    pil_img = remove_alpha_channel(pil_img)

    # Convert to OpenCV
    img = pil_to_cv2(pil_img)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Rescaling (very important)
    scale_factor = 2
    gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)

    # 1. Inverted Images detection (if background is dark)
    if np.mean(gray) < 127:
        gray = cv2.bitwise_not(gray)

    # 4. Noise removal (before threshold)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # 3. Binarization (Adaptive threshold works best for notes)
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 10
    )

    # 5. Dilation and erosion (clean broken characters)
    kernel = np.ones((2, 2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)

    # 6. Deskew
    coords = np.column_stack(np.where(thresh < 255))
    if len(coords) > 1000:
        angle = cv2.minAreaRect(coords)[-1]

        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        (h, w) = thresh.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # 7. Removing Borders
    thresh = remove_borders(thresh)

    # Return PIL image
    final_pil = Image.fromarray(thresh)
    return final_pil


def remove_borders(img):
    """7 & 8: Remove borders / handle missing borders"""
    h, w = img.shape[:2]

    # Crop 2% margin (safe crop)
    margin_h = int(h * 0.02)
    margin_w = int(w * 0.02)

    cropped = img[margin_h:h - margin_h, margin_w:w - margin_w]
    return cropped
