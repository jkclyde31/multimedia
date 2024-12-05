'use client';

import React, { useEffect, useRef, useState } from 'react';
import { savePhoto, listPhotos } from '@/lib/fileUtils';
import { Camera, Check, X, Loader2 } from 'lucide-react';

export default function PhotoCapture() {
  const [photoList, setPhotoList] = useState([]);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch existing photos when component mounts
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photos = await listPhotos();
        setPhotoList(photos);
      } catch (err) {
        setError('Failed to fetch photos');
        console.error(err);
      }
    };

    fetchPhotos();
  }, []);

  // Open camera stream
  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment' // Prefer back camera on mobile
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
  
    setIsLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    if (!context) {
      setIsLoading(false);
      return;
    }
  
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    
    // Stop camera preview
    stopCamera();
    setIsLoading(false);
  };

  const saveCapture = async () => {
    if (!capturedImage) return;

    try {
      setIsLoading(true);
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Generate a unique filename
      const fileName = `photo_${new Date().toISOString()}.png`;

      // Create FormData
      const formData = new FormData();
      formData.append('blob', blob, fileName);
      formData.append('fileName', fileName);

      // Save photo
      const result = await savePhoto(formData);

      if (result.success) {
        // Update photo list
        setPhotoList(prev => [fileName, ...prev]);
        // Clear captured image
        setCapturedImage(null);
      }
    } catch (err) {
      setError(`Photo save failed: ${err.message}`);
      console.error('Photo save error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const discardCapture = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Photo Capture</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Video Preview or Captured Image */}
      <div className="mb-4 relative">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-auto border rounded"
          />
        ) : (
          <video 
            ref={videoRef} 
            className="w-full h-auto border rounded"
            style={{ display: cameraActive ? 'block' : 'none' }}
          />
        )}
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={48} />
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="flex space-x-4 mb-4">
        {/* Initial Camera State */}
        {!cameraActive && !capturedImage && (
          <button 
            onClick={startCamera}
            disabled={isLoading}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <Camera size={20} />
            <span>Open Camera</span>
          </button>
        )}

        {/* Camera Active State */}
        {cameraActive && !capturedImage && (
          <>
            <button 
              onClick={capturePhoto}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
            >
              <Camera size={20} />
              <span>Capture Photo</span>
            </button>
            <button 
              onClick={stopCamera}
              disabled={isLoading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
            >
              Close Camera
            </button>
          </>
        )}

        {/* Captured Image State */}
        {capturedImage && (
          <div className="flex space-x-4">
            <button 
              onClick={saveCapture}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
            >
              <Check size={20} />
              <span>Save Photo</span>
            </button>
            <button 
              onClick={discardCapture}
              disabled={isLoading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
            >
              <X size={20} />
              <span>Discard</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved Photos List */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-black">Saved Photos</h2>
        {photoList.length === 0 ? (
          <p className='text-black'>No photos saved yet</p>
        ) : (
          <ul className="space-y-2">
            {photoList.map((photo, index) => (
              <li 
                key={index} 
                className="bg-gray-100 p-2 rounded text-black flex justify-between items-center"
              >
                <span>{photo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}