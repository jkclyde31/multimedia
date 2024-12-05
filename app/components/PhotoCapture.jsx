'use client';

import React, { useEffect, useRef, useState } from 'react';
import { savePhoto, listPhotos } from '@/lib/fileUtils';

export default function PhotoCapture() {
  const [photoList, setPhotoList] = useState([]);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
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
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    if (!context) return;
  
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture photo: Blob creation failed');
        return;
      }
  
      try {
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
        }
      } catch (err) {
        // Catch and display more detailed error information
        setError(`Photo save failed: ${err.message}`);
        console.error('Photo save error details:', err);
      }
    }, 'image/png');
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current) {
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

      {/* Video Preview */}
      <div className="mb-4">
        <video 
          ref={videoRef} 
          className="w-full h-auto border rounded"
          style={{ display: cameraActive ? 'block' : 'none' }}
        />
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
      </div>

      {/* Camera Controls */}
      <div className="flex space-x-4 mb-4">
        {!cameraActive ? (
          <button 
            onClick={startCamera}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Open Camera
          </button>
        ) : (
          <>
            <button 
              onClick={capturePhoto}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Capture Photo
            </button>
            <button 
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close Camera
            </button>
          </>
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
                className="bg-gray-100 p-2 rounded text-black"
              >
                {photo}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}