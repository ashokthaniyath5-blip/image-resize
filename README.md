# Image Resizer Web Application

A professional web-based image resizing tool that allows users to upload, resize, and download images with precision control over dimensions, DPI, format, and quality.

## Features

- **Drag & Drop Upload**: Simply drag images onto the interface or click to browse
- **Precise Resizing**: Set exact pixel dimensions with optional aspect ratio maintenance
- **DPI Control**: Specify DPI for print-quality outputs
- **Multiple Formats**: Export as PNG, JPEG, or WebP
- **Quality Control**: Adjust compression quality for JPEG and WebP formats
- **Live Preview**: See original and resized images side-by-side
- **High-Quality Resampling**: Uses advanced canvas rendering for crisp results
- **Responsive Design**: Works on desktop and mobile devices

## Supported Formats

**Input**: JPG, PNG, GIF, WebP, and other common image formats
**Output**: PNG, JPEG, WebP

## How to Use

1. **Upload Image**: Drag and drop an image file or click the upload area to browse
2. **Set Dimensions**: Enter desired width and height in pixels
3. **Configure Options**:
   - DPI: Set resolution for print quality (optional)
   - Format: Choose output format (PNG, JPEG, WebP)
   - Quality: Adjust compression (1-100, higher = better quality)
   - Aspect Ratio: Toggle to maintain original proportions
4. **Resize**: Click "Resize Image" to process
5. **Download**: Click "Download Resized Image" to save the result

## Technical Details

- **Client-Side Processing**: All image processing happens in your browser - no server uploads
- **High-Quality Rendering**: Uses HTML5 Canvas with high-quality image smoothing
- **Memory Efficient**: Optimized for large images up to 50MB
- **Cross-Browser Compatible**: Works in all modern browsers

## File Structure

```
image-resizer/
├── index.html          # Main HTML interface
├── script.js           # JavaScript functionality
└── README.md          # This documentation
```

## Running the Application

1. Open `index.html` in any modern web browser
2. No server setup required - runs entirely client-side
3. For local development, you can use any static file server

## Browser Requirements

- Modern browser with HTML5 Canvas support
- JavaScript enabled
- File API support for drag & drop functionality

## Privacy & Security

- All processing happens locally in your browser
- No images are uploaded to any server
- No data is stored or transmitted
- Complete privacy and security for your images