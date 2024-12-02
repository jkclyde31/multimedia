'use client';

import React, { useEffect, useState } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";
// import { savePhoto, listPhotos } from './photoActions';
import { savePhoto, listPhotos } from '@/lib/fileUtils';

export default function PhotoCapture() {
  const [photoList, setPhotoList] = useState([]);
  const [error, setError] = useState(null);

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

  const { 
    status, 
    startRecording, 
    stopRecording, 
    mediaBlobUrl 
  } = useReactMediaRecorder({ 
    video: true,
    mediaRecorderOptions: {
      mimeType: 'image/png'
    }
  });

  // Handle photo capture and save
  const handleCapture = async () => {
    try {
      // Stop recording to get the image blob
      stopRecording();

      // Wait a moment for the blob to be ready
      setTimeout(async () => {
        if (mediaBlobUrl) {
          // Fetch the blob
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();

          // Generate a unique filename
          const fileName = `photo_${new Date().toISOString()}.png`;

          // Create FormData
          const formData = new FormData();
          formData.append('blob', blob);
          formData.append('fileName', fileName);

          // Save photo
          const result = await savePhoto(formData);

          if (result.success) {
            // Update photo list
            setPhotoList(prev => [fileName, ...prev]);
            
            // Restart recording
            startRecording();
          }
        }
      }, 1000);
    } catch (err) {
      setError('Failed to save photo');
      console.error(err);
    }
  };

  // Start recording on component mount
  useEffect(() => {
    startRecording();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Capture</h1>

      {/* Status Display */}
      <p className="mb-4">Status: {status}</p>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Video Preview */}
      <div className="mb-4">
        <video 
          src={mediaBlobUrl} 
          controls 
          autoPlay 
          loop 
          className="w-full h-auto border rounded"
        />
      </div>

      {/* Capture Button */}
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={handleCapture}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Capture Photo
        </button>
      </div>

      {/* Saved Photos List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Saved Photos</h2>
        {photoList.length === 0 ? (
          <p>No photos saved yet</p>
        ) : (
          <ul className="space-y-2">
            {photoList.map((photo, index) => (
              <li 
                key={index} 
                className="bg-gray-100 p-2 rounded"
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