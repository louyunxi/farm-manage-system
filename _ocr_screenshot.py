from PIL import Image
import sys

img_path = r"E:\AI\farm-manage-system\_screenshot_question.png"
try:
    im = Image.open(img_path)
    print(f"Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
    import pytesseract
    text = pytesseract.image_to_string(im, lang='chi_sim+eng')
    print("OCR Text:")
    print(text[:5000])
except ImportError as e:
    print(f"Import error: {e}")
except Exception as e:
    print(f"Error: {e}")
