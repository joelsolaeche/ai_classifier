'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon, FileImage, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClearImage: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onClearImage,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onImageSelect(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleClear = () => {
    onClearImage();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (selectedImage && previewUrl) {
    return (
      <Card className="w-full bg-white/70 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Image Preview */}
            <div className="relative w-full h-80 rounded-t-xl overflow-hidden">
              <Image
                src={previewUrl}
                alt="Selected image"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Remove Button */}
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-red-50/80 border-red-200 text-red-600 hover:bg-red-100/80 backdrop-blur-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>

            {/* Success Badge */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50/80 backdrop-blur-sm border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Image Ready</span>
              </div>
            </div>
          </div>
          
          {/* Image Info */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 border border-gray-200/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <FileImage className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700">File Name</span>
                </div>
                <p className="text-sm text-gray-800 font-mono truncate">{selectedImage.name}</p>
              </div>
              <div className="bg-white/50 border border-gray-200/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Upload className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-700">File Size</span>
                </div>
                <p className="text-sm text-gray-800 font-mono">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white/60 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={`
            relative p-12 text-center cursor-pointer transition-all duration-300 rounded-xl
            ${isDragActive 
              ? 'bg-blue-50/80 border-2 border-dashed border-blue-400 scale-105' 
              : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {/* Upload Icon */}
          <div className="mb-6">
            <div className={`
              w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragActive 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 scale-110' 
                : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:scale-110'
              }
            `}>
              {isDragActive ? (
                <Upload className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <ImageIcon className="w-10 h-10 text-blue-500" />
              )}
            </div>
          </div>
          
          {/* Upload Text */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {isDragActive ? 'Drop your image here' : 'Upload an image'}
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                {isDragActive ? 'Release to upload your image' : 'Drag and drop your image here, or'}{' '}
                {!isDragActive && (
                  <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer">
                    browse files
                  </span>
                )}
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>JPG, PNG, GIF</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upload Button */}
          {!isDragActive && (
            <div className="mt-8">
              <Button 
                type="button"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 