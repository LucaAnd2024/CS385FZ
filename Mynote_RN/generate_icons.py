import os
import subprocess
import json
import sys

# Configuration
SOURCE_IMAGE = "./src/assets/icons/appIcon.png"
IOS_ICON_DIR = "./ios/Mynote_RN/Images.xcassets/AppIcon.appiconset"
ANDROID_RES_DIR = "./android/app/src/main/res"

def run_sips(source, dest, width, height):
    """Resizes image using sips (macOS built-in)."""
    subprocess.run(["sips", "-z", str(height), str(width), source, "--out", dest], check=True, stdout=subprocess.DEVNULL)

def generate_ios_icons():
    print("Generating iOS icons...")
    if not os.path.exists(IOS_ICON_DIR):
        print(f"Error: iOS directory {IOS_ICON_DIR} not found.")
        return

    images = []
    
    # Define iOS sizes: (point_size, scale, idioms)
    ios_sizes = [
        (20, 2, "iphone"), (20, 3, "iphone"),
        (29, 2, "iphone"), (29, 3, "iphone"),
        (40, 2, "iphone"), (40, 3, "iphone"),
        (60, 2, "iphone"), (60, 3, "iphone"),
        (1024, 1, "ios-marketing")
    ]

    for point, scale, idiom in ios_sizes:
        pixel_size = point * scale
        filename = f"icon_{point}pt_{scale}x.png"
        dest_path = os.path.join(IOS_ICON_DIR, filename)
        
        run_sips(SOURCE_IMAGE, dest_path, pixel_size, pixel_size)
        
        entry = {
            "size": f"{point}x{point}",
            "idiom": idiom,
            "filename": filename,
            "scale": f"{scale}x"
        }
        images.append(entry)

    # Write Contents.json
    contents = {
        "images": images,
        "info": {"version": 1, "author": "xcode"}
    }
    
    with open(os.path.join(IOS_ICON_DIR, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)
    
    print("iOS icons generated and Contents.json updated.")

def generate_android_icons():
    print("\nGenerating Android icons...")
    if not os.path.exists(ANDROID_RES_DIR):
        print(f"Error: Android directory {ANDROID_RES_DIR} not found.")
        return

    # Map density folder to pixel size (standard sizes)
    android_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    for folder, size in android_sizes.items():
        folder_path = os.path.join(ANDROID_RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # ic_launcher.png (Square)
        dest_path = os.path.join(folder_path, "ic_launcher.png")
        run_sips(SOURCE_IMAGE, dest_path, size, size)
        
        # ic_launcher_round.png. NOTE: sips doesn't support masking easily, 
        # so we will use the same square icon for round for now to prevent errors,
        # or just resize it. Android usually handles square icons in round slots optionally,
        # but ideally this should be a round image. 
        # For a quick fix without external deps, we'll resize the same image.
        dest_round_path = os.path.join(folder_path, "ic_launcher_round.png")
        run_sips(SOURCE_IMAGE, dest_round_path, size, size)
        
    print("Android icons generated.")

if __name__ == "__main__":
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: Source image not found at {SOURCE_IMAGE}")
        sys.exit(1)
        
    print(f"Using source image: {SOURCE_IMAGE}")
    generate_ios_icons()
    generate_android_icons()
    print("\n✅ Done! Please rebuild your app to see changes.")
