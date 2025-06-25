import requests
import os

# Set your FAL API key here
FAL_API_KEY = "45315040-51d5-43bc-bdb9-dc58801e66f2:9724cb8e915be00426974a7ef9b2704a"

UPLOAD_URL = "https://fal.run/upload"  # or "https://fal.run/upload_file" if that's what works
MODEL_URL = "https://api.fal.ai/fal-ai/bagel/understand"


def upload_image(file_path):
    """
    Uploads an image to FAL's upload endpoint and returns the hosted image_url.
    """
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "image/jpeg")}
        response = requests.post(UPLOAD_URL, files=files)
        response.raise_for_status()
        data = response.json()
        return data["url"]


def analyze_image(image_url, api_key):
    """
    Sends the image_url to the FAL bagel model and returns the description.
    """
    headers = {"Authorization": f"Key {api_key}", "Content-Type": "application/json"}
    payload = {
        "image_url": image_url,
        "prompt": "Describe this person's hair type, color, and skin tone."
    }
    response = requests.post(MODEL_URL, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    return data.get("text") or data


def main():
    print("FAL AI Selfie Analyzer\n----------------------")
    file_path = input("Enter the path to your selfie image (e.g., selfie.jpg): ").strip()
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        return

    print("Uploading image to FAL...")
    try:
        image_url = upload_image(file_path)
        print(f"Image uploaded. URL: {image_url}")
    except Exception as e:
        print(f"Failed to upload image: {e}")
        return

    print("\nAnalyzing image with FAL AI Bagel model...")
    try:
        description = analyze_image(image_url, FAL_API_KEY)
        print("\nDescription:")
        print(description)
    except Exception as e:
        print(f"Failed to analyze image: {e}")


if __name__ == "__main__":
    main() 