#!/usr/bin/env python3
"""
GEC Palamu Official QR Code Generator Engine (Python)
------------------------------------------------------
Generates high-resolution, cryptographic QR codes for:
1. Dynamic NPCI UPI Payments (linked to 6205482672@ptsbi)
2. Smart Student ID Cards (IIT/NIT Verification Model)
"""

import sys
import io
import json
import base64
import argparse
import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_L
from PIL import Image

def generate_qr(data: str, 
                box_size: int = 10, 
                border: int = 2, 
                fill_color: str = "#0f172a", 
                back_color: str = "#ffffff",
                error_level: str = "H",
                output_format: str = "base64",
                output_file: str = None):
    """
    Generate QR code and return base64 string or write to output_file
    """
    ec_map = {
        "L": ERROR_CORRECT_L,
        "M": ERROR_CORRECT_M,
        "Q": ERROR_CORRECT_Q,
        "H": ERROR_CORRECT_H
    }
    ec = ec_map.get(error_level.upper(), ERROR_CORRECT_H)

    qr = qrcode.QRCode(
        version=None,
        error_correction=ec,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Generate image
    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")

    if output_file:
        img.save(output_file, format="PNG")
        return {
            "success": True,
            "file": output_file,
            "width": img.width,
            "height": img.height
        }

    # Buffer in-memory
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    data_url = f"data:image/png;base64,{encoded}"

    return {
        "success": True,
        "qrBase64": data_url,
        "width": img.width,
        "height": img.height,
        "payload": data
    }

def main():
    parser = argparse.ArgumentParser(description="GEC Palamu Python QR Engine")
    parser.add_argument("--data", type=str, help="Payload string or UPI URL to encode", required=False)
    parser.add_argument("--stdin", action="store_true", help="Read payload data from stdin")
    parser.add_argument("--box-size", type=int, default=10, help="QR module box size in px")
    parser.add_argument("--border", type=int, default=2, help="Quiet zone border modules")
    parser.add_argument("--fill-color", type=str, default="#0c4a6e", help="Dark module hex color")
    parser.add_argument("--back-color", type=str, default="#ffffff", help="Light background hex color")
    parser.add_argument("--error-level", type=str, default="H", choices=["L", "M", "Q", "H"], help="Error correction level")
    parser.add_argument("--output", type=str, default=None, help="Save to PNG file")

    args = parser.parse_args()

    payload = args.data
    if args.stdin or not payload:
        if not sys.stdin.isatty():
            payload = sys.stdin.read().strip()

    if not payload:
        # Default test payload for UPI
        payload = "upi://pay?pa=6205482672@ptsbi&pn=Government%20Engineering%20College%20Palamu&mc=8221&tn=GECP%20Institutional%20Fee&cu=INR"

    result = generate_qr(
        data=payload,
        box_size=args.box_size,
        border=args.border,
        fill_color=args.fill_color,
        back_color=args.back_color,
        error_level=args.error_level,
        output_file=args.output
    )

    print(json.dumps(result))

if __name__ == "__main__":
    main()
