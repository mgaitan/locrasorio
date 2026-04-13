#!/usr/bin/env python3
"""
Convert HEIC→JPG, collect all personal photos, sort by EXIF date,
and move to public/images/gallery/.
Venue photos (lugar-*.jpg, el-casco-*.png) stay in public/images/.
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

import pillow_heif
from PIL import Image, ExifTags, ImageOps

pillow_heif.register_heif_opener()

SRC = Path('/home/tin/lab/locrasorio/public/images')
GALLERY = SRC / 'gallery'
GALLERY.mkdir(exist_ok=True)

MAX_DIM = 1800  # max width or height for output JPGs

# Files excluded from gallery (venue/static assets and special-purpose images)
EXCLUDE_NAMES = {'ema_locro.jpeg', 'argentina_qatar.jpg', 'locro.webp', 'el-casco-01.png'}
VENUE_PREFIXES = ('lugar-', 'el-casco-')
VENUE_FILES = {f for f in SRC.iterdir()
               if f.is_file() and (
                   any(f.name.startswith(p) for p in VENUE_PREFIXES)
                   or f.name in EXCLUDE_NAMES
               )}

def get_exif_date(img: Image.Image) -> datetime | None:
    try:
        exif = img._getexif()
        if exif is None:
            return None
        for tag_id, val in exif.items():
            tag = ExifTags.TAGS.get(tag_id, '')
            if tag in ('DateTimeOriginal', 'DateTime'):
                return datetime.strptime(val, '%Y:%m:%d %H:%M:%S')
    except Exception:
        pass
    return None

def date_from_filename(name: str) -> datetime | None:
    """Try to parse a date from filename."""
    import re
    # YYYY-MM-DD (WhatsApp, etc.)
    m = re.search(r'(\d{4}-\d{2}-\d{2})', name)
    if m:
        try:
            return datetime.strptime(m.group(1), '%Y-%m-%d')
        except Exception:
            pass
    # YYYYMMDD_HHMMSS or YYYYMMDD (Android, etc.)
    m = re.search(r'(\d{8}_\d{6})', name)
    if m:
        try:
            return datetime.strptime(m.group(1), '%Y%m%d_%H%M%S')
        except Exception:
            pass
    m = re.search(r'(\d{8})', name)
    if m:
        try:
            return datetime.strptime(m.group(1), '%Y%m%d')
        except Exception:
            pass
    return None

def resize(img: Image.Image) -> Image.Image:
    w, h = img.size
    if max(w, h) <= MAX_DIM:
        return img
    ratio = MAX_DIM / max(w, h)
    return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

# Collect all personal photo files (everything except venue files)
personal_exts = {'.jpg', '.jpeg', '.JPG', '.png', '.heic', '.HEIC'}
candidates = [
    f for f in SRC.iterdir()
    if f.is_file()
    and f.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic'}
    and f not in VENUE_FILES
]

print(f"Found {len(candidates)} personal photos to process")

entries = []
for src_path in candidates:
    print(f"  Processing {src_path.name} ...")
    try:
        img = Image.open(src_path)
        img = ImageOps.exif_transpose(img)
        img = img.convert('RGB')
        dt = get_exif_date(img) or date_from_filename(src_path.name)
        entries.append((dt or datetime(1970, 1, 1), src_path, img))
    except Exception as e:
        print(f"    ERROR: {e}")

# Sort by date
entries.sort(key=lambda x: x[0])

# Save as gallery/gallery-NN.jpg
for i, (dt, src_path, img) in enumerate(entries, 1):
    img = resize(img)
    out_name = f'gallery-{i:02d}.jpg'
    out_path = GALLERY / out_name
    img.save(out_path, 'JPEG', quality=88, optimize=True)
    date_str = dt.strftime('%Y-%m-%d') if dt.year != 1970 else 'unknown'
    print(f"  {src_path.name:45s} → {out_name}  ({date_str})")

print(f"\nDone. {len(entries)} photos in {GALLERY}")
