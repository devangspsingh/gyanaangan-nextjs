'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, X, Check, Crop as CropIcon } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUploadCrop({ 
  onImageCropped, 
  aspectRatio = 16 / 9, 
  label = "Upload Image",
  currentImage = null 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImagePreview, setCroppedImagePreview] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (croppedImagePreview) {
        URL.revokeObjectURL(croppedImagePreview);
      }
    };
  }, [croppedImagePreview]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg();
      
      if (croppedBlob) {
        const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
        
        // Create preview URL for the cropped image
        const previewUrl = URL.createObjectURL(croppedBlob);
        setCroppedImagePreview(previewUrl);
        
        // Pass the blob/file to parent component
        await onImageCropped(file);
        setImageSrc(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCroppedImage = () => {
    if (croppedImagePreview) {
      URL.revokeObjectURL(croppedImagePreview);
    }
    setCroppedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Cropped Image Preview */}
      {croppedImagePreview && !imageSrc && (
        <div className="relative">
          <img 
            src={croppedImagePreview} 
            alt="Cropped preview" 
            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleRemoveCroppedImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Image ready - will be uploaded when you save the post
          </p>
        </div>
      )}

      {/* Current Image Preview */}
      {currentImage && !imageSrc && !croppedImagePreview && (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Current" 
            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Current image - upload a new one to replace
          </p>
        </div>
      )}

      {/* Upload Button */}
      {!imageSrc && !croppedImagePreview && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>{label}</span>
          </label>
        </div>
      )}

      {/* Cropper */}
      {imageSrc && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CropIcon className="w-4 h-4" />
              <span>Crop your image</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop || uploading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-w-full h-auto"
            />
          </ReactCrop>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag to adjust the crop area. Click Apply when ready.
          </p>
        </div>
      )}
    </div>
  );
}
