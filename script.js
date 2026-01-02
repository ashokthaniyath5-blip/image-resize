class ImageResizer {
    constructor() {
        this.originalImage = null;
        this.originalCanvas = null;
        this.resizedCanvas = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.widthInput = document.getElementById('width');
        this.heightInput = document.getElementById('height');
        this.dpiInput = document.getElementById('dpi');
        this.formatSelect = document.getElementById('format');
        this.qualityInput = document.getElementById('quality');
        this.targetFileSizeSelect = document.getElementById('targetFileSize');
        this.customSizeGroup = document.getElementById('customSizeGroup');
        this.minSizeInput = document.getElementById('minSize');
        this.maxSizeInput = document.getElementById('maxSize');
        this.maintainAspectCheckbox = document.getElementById('maintainAspect');
        this.resizeBtn = document.getElementById('resizeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.preset150x200 = document.getElementById('preset150x200');
        this.presetCustom = document.getElementById('presetCustom');
        this.previewSection = document.getElementById('previewSection');
        this.originalPreview = document.getElementById('originalPreview');
        this.resizedPreview = document.getElementById('resizedPreview');
        this.originalInfo = document.getElementById('originalInfo');
        this.resizedInfo = document.getElementById('resizedInfo');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        // Dimension input events
        this.widthInput.addEventListener('input', () => this.handleDimensionChange('width'));
        this.heightInput.addEventListener('input', () => this.handleDimensionChange('height'));
        
        // File size control events
        this.targetFileSizeSelect.addEventListener('change', () => this.handleFileSizeChange());
        
        // Preset events
        this.preset150x200.addEventListener('click', () => this.applyPreset('150x200'));
        this.presetCustom.addEventListener('click', () => this.applyPreset('custom'));
        
        // Button events
        this.resizeBtn.addEventListener('click', () => this.resizeImage());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Format change event
        this.formatSelect.addEventListener('change', () => this.updateQualityVisibility());
    }

    handleFileSelect(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showError('File size too large. Please select an image under 50MB.');
            return;
        }

        this.loadImage(file);
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.displayOriginalImage();
                this.populateDefaultDimensions();
                this.resizeBtn.disabled = false;
                this.hideMessages();
            };
            img.onerror = () => {
                this.showError('Failed to load image. Please try another file.');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImage() {
        this.originalPreview.src = this.originalImage.src;
        this.originalInfo.innerHTML = `
            <strong>Dimensions:</strong> ${this.originalImage.width} × ${this.originalImage.height}px<br>
            <strong>Aspect Ratio:</strong> ${(this.originalImage.width / this.originalImage.height).toFixed(2)}:1
        `;
        this.previewSection.style.display = 'block';
    }

    populateDefaultDimensions() {
        this.widthInput.value = this.originalImage.width;
        this.heightInput.value = this.originalImage.height;
    }

    handleFileSizeChange() {
        const value = this.targetFileSizeSelect.value;
        if (value === 'custom') {
            this.customSizeGroup.classList.remove('hidden');
        } else {
            this.customSizeGroup.classList.add('hidden');
        }
    }

    applyPreset(presetType) {
        // Remove active class from all presets
        document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
        
        if (presetType === '150x200') {
            this.preset150x200.classList.add('active');
            // Set EXACT dimensions - no aspect ratio maintenance
            this.widthInput.value = '150';
            this.heightInput.value = '200';
            this.formatSelect.value = 'jpeg';
            this.qualityInput.value = '92'; // Start higher for better optimization range
            this.targetFileSizeSelect.value = '30-500';
            this.maintainAspectCheckbox.checked = false; // CRITICAL: Disable aspect ratio for exact dimensions
            this.dpiInput.value = '72';
            
            // Lock dimensions to prevent changes
            this.widthInput.readOnly = true;
            this.heightInput.readOnly = true;
            this.maintainAspectCheckbox.disabled = true;
            
            this.showSuccess('Preset applied: 150×200px JPEG with 30-500KB file size target. Upload an image to begin.');
        } else {
            this.presetCustom.classList.add('active');
            // Unlock dimensions for custom settings
            this.widthInput.readOnly = false;
            this.heightInput.readOnly = false;
            this.maintainAspectCheckbox.disabled = false;
        }
        
        this.handleFileSizeChange();
        this.updateQualityVisibility();
    }

    handleDimensionChange(changedDimension) {
        if (!this.originalImage || !this.maintainAspectCheckbox.checked) return;

        const aspectRatio = this.originalImage.width / this.originalImage.height;
        
        if (changedDimension === 'width') {
            const newWidth = parseInt(this.widthInput.value);
            if (newWidth > 0) {
                this.heightInput.value = Math.round(newWidth / aspectRatio);
            }
        } else {
            const newHeight = parseInt(this.heightInput.value);
            if (newHeight > 0) {
                this.widthInput.value = Math.round(newHeight * aspectRatio);
            }
        }
    }

    resizeImage() {
        if (!this.originalImage) return;

        const targetWidth = parseInt(this.widthInput.value);
        const targetHeight = parseInt(this.heightInput.value);
        const targetDPI = parseInt(this.dpiInput.value) || 72;
        const format = this.formatSelect.value;
        let quality = parseInt(this.qualityInput.value) / 100;

        if (!targetWidth || !targetHeight || targetWidth <= 0 || targetHeight <= 0) {
            this.showError('Please enter valid width and height values.');
            return;
        }

        // Validate exact dimensions for preset
        if (this.preset150x200.classList.contains('active')) {
            if (targetWidth !== 150 || targetHeight !== 200) {
                this.showError('Preset requires EXACT dimensions of 150×200 pixels.');
                return;
            }
        }

        try {
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Use high-quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw resized image
            ctx.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);

            // Handle file size requirements
            const fileSizeTarget = this.getFileSizeTarget();
            if (fileSizeTarget) {
                console.log(`Target file size: ${fileSizeTarget.min}-${fileSizeTarget.max}KB`);
                const result = this.optimizeForFileSize(canvas, format, quality, fileSizeTarget);
                quality = result.quality;
                
                if (!result.success) {
                    // Show warning but still allow download
                    this.showError(`Warning: Could not achieve exact target file size of ${fileSizeTarget.min}-${fileSizeTarget.max}KB. Actual size: ${result.actualSize}KB. You can still download the image or adjust settings.`);
                    // Don't return - continue to show preview and allow download
                }
            }

            // Verify exact dimensions
            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                this.showError(`Failed to create exact dimensions. Got ${canvas.width}×${canvas.height} instead of ${targetWidth}×${targetHeight}`);
                return;
            }

            // Display preview
            const finalDataURL = canvas.toDataURL(`image/${format}`, quality);
            this.resizedPreview.src = finalDataURL;
            
            // Calculate actual file size
            const actualFileSize = this.calculateFileSize(finalDataURL);
            
            this.resizedInfo.innerHTML = `
                <strong>✓ Exact Dimensions:</strong> ${targetWidth} × ${targetHeight}px<br>
                <strong>DPI:</strong> ${targetDPI}<br>
                <strong>Format:</strong> ${format.toUpperCase()}<br>
                <strong>Quality:</strong> ${Math.round(quality * 100)}%<br>
                <strong>File Size:</strong> ${actualFileSize}KB
                ${this.getFileSizeStatus(actualFileSize, fileSizeTarget)}
            `;

            // Prepare download
            this.prepareDownload(canvas, format, quality);
            
            // Success message with dimension confirmation
            const dimensionConfirm = this.preset150x200.classList.contains('active') 
                ? `Image resized to EXACT dimensions: ${targetWidth}×${targetHeight}px, ${actualFileSize}KB. ` 
                : 'Image resized successfully! ';
            this.showSuccess(dimensionConfirm + 'Click download to save.');

        } catch (error) {
            this.showError('Failed to resize image. Please try again.');
            console.error('Resize error:', error);
        }
    }

    getFileSizeTarget() {
        const value = this.targetFileSizeSelect.value;
        if (!value) return null;
        
        if (value === '30-500') {
            return { min: 30, max: 500 };
        } else if (value === '100-1000') {
            return { min: 100, max: 1000 };
        } else if (value === 'custom') {
            const min = parseInt(this.minSizeInput.value);
            const max = parseInt(this.maxSizeInput.value);
            if (min && max && min < max) {
                return { min, max };
            }
        }
        return null;
    }

    optimizeForFileSize(canvas, format, initialQuality, target) {
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let quality = initialQuality;
        let bestQuality = quality;
        let bestSize = 0;
        const maxAttempts = 25;
        let attempts = 0;
        
        // Binary search for optimal quality
        while (attempts < maxAttempts) {
            const dataURL = canvas.toDataURL(`image/${format}`, quality);
            const fileSize = this.calculateFileSize(dataURL);
            
            console.log(`Attempt ${attempts + 1}: Quality=${(quality * 100).toFixed(1)}%, Size=${fileSize}KB, Target=${target.min}-${target.max}KB`);
            
            // Check if we're within target range
            if (fileSize >= target.min && fileSize <= target.max) {
                console.log(`✓ Success! Found optimal quality: ${(quality * 100).toFixed(1)}%`);
                return { success: true, quality, actualSize: fileSize };
            }
            
            // Store best attempt (closest to target range)
            if (fileSize >= target.min && fileSize <= target.max) {
                bestQuality = quality;
                bestSize = fileSize;
            } else if (Math.abs(fileSize - target.min) < Math.abs(bestSize - target.min)) {
                bestQuality = quality;
                bestSize = fileSize;
            }
            
            // Binary search adjustment
            if (fileSize > target.max) {
                // File too large, reduce quality
                maxQuality = quality;
                quality = (minQuality + quality) / 2;
            } else if (fileSize < target.min) {
                // File too small, increase quality
                minQuality = quality;
                quality = (quality + maxQuality) / 2;
            }
            
            // Prevent infinite loops
            if (maxQuality - minQuality < 0.01) {
                break;
            }
            
            attempts++;
        }
        
        // If we couldn't find exact match, try to get as close as possible
        // Prefer being slightly under max rather than over
        if (bestSize > 0 && bestSize <= target.max * 1.1) {
            console.log(`Using best attempt: Quality=${(bestQuality * 100).toFixed(1)}%, Size=${bestSize}KB`);
            return { success: true, quality: bestQuality, actualSize: bestSize };
        }
        
        // Last resort: try multiple quality levels to find best fit
        const testQualities = [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50];
        for (const testQuality of testQualities) {
            const dataURL = canvas.toDataURL(`image/${format}`, testQuality);
            const fileSize = this.calculateFileSize(dataURL);
            
            if (fileSize >= target.min && fileSize <= target.max) {
                console.log(`✓ Found match with quality ${(testQuality * 100).toFixed(0)}%: ${fileSize}KB`);
                return { success: true, quality: testQuality, actualSize: fileSize };
            }
            
            if (fileSize < target.max && fileSize > bestSize) {
                bestQuality = testQuality;
                bestSize = fileSize;
            }
        }
        
        const finalDataURL = canvas.toDataURL(`image/${format}`, bestQuality);
        const finalSize = this.calculateFileSize(finalDataURL);
        
        console.warn(`Could not achieve exact target. Best: Quality=${(bestQuality * 100).toFixed(1)}%, Size=${finalSize}KB`);
        return { success: false, quality: bestQuality, actualSize: finalSize };
    }

    calculateFileSize(dataURL) {
        // Remove data URL prefix
        const base64String = dataURL.split(',')[1];
        
        // Calculate actual byte size from base64
        // Base64 encoding increases size by ~33%, so we need to account for padding
        let padding = 0;
        if (base64String.endsWith('==')) padding = 2;
        else if (base64String.endsWith('=')) padding = 1;
        
        const sizeInBytes = (base64String.length * 3 / 4) - padding;
        const sizeInKB = sizeInBytes / 1024;
        
        return Math.round(sizeInKB);
    }

    getFileSizeStatus(actualSize, target) {
        if (!target) return '';
        
        if (actualSize >= target.min && actualSize <= target.max) {
            return '<br><span class="file-size-success">✓ File size within target range (30-500KB)</span>';
        } else if (actualSize < target.min) {
            return `<br><span class="file-size-warning">⚠ File size below minimum (${actualSize}KB < ${target.min}KB)</span>`;
        } else {
            return `<br><span class="file-size-warning">⚠ File size above maximum (${actualSize}KB > ${target.max}KB)</span>`;
        }
    }

    prepareDownload(canvas, format, quality) {
        const mimeType = `image/${format}`;
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        this.downloadBtn.href = dataURL;
        this.downloadBtn.download = `resized-image.${format}`;
        this.downloadBtn.classList.remove('hidden');
    }

    updateQualityVisibility() {
        const format = this.formatSelect.value;
        const qualityGroup = this.qualityInput.parentElement;
        
        if (format === 'png') {
            qualityGroup.style.opacity = '0.5';
            this.qualityInput.disabled = true;
        } else {
            qualityGroup.style.opacity = '1';
            this.qualityInput.disabled = false;
        }
    }

    reset() {
        this.originalImage = null;
        this.fileInput.value = '';
        this.widthInput.value = '';
        this.heightInput.value = '';
        this.dpiInput.value = '';
        this.qualityInput.value = '90';
        this.formatSelect.value = 'png';
        this.targetFileSizeSelect.value = '';
        this.minSizeInput.value = '';
        this.maxSizeInput.value = '';
        this.maintainAspectCheckbox.checked = true;
        this.resizeBtn.disabled = true;
        this.downloadBtn.classList.add('hidden');
        this.previewSection.style.display = 'none';
        this.customSizeGroup.classList.add('hidden');
        
        // Reset preset buttons
        document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
        this.presetCustom.classList.add('active');
        
        this.hideMessages();
        this.updateQualityVisibility();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
    }

    hideMessages() {
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.add('hidden');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageResizer();
});