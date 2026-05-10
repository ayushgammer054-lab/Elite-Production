import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_bg(in_path, out_path, threshold=30, feather=30):
    img = Image.open(in_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            luminance = max(r, g, b)
            
            if luminance < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            elif luminance < threshold + feather:
                alpha = int(((luminance - threshold) / feather) * 255)
                pixels[x, y] = (r, g, b, alpha)

    img.save(out_path, "PNG")

remove_bg(r"e:\Elite production\public\logo.jpg", r"e:\Elite production\public\logo-transparent.png")
print("Background removed successfully.")
