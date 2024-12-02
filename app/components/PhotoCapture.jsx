'use client';

import React, { useState, useCallback, useEffect } from 'react';
// import { savePhoto, listPhotos } from './photoActions';
import { savePhoto, listPhotos } from '@/lib/fileUtils';
import { useReactMediaRecorder } from 'react-media-recorder';

export default function PhotoCapture() {
  const [photoList, setPhotoList] = useState([]);
  const [error, setError] = useState(null);

  const {
    startRecording,
    stopRecording,
    mediaBlobUrl
  } = useReactMediaRecorder({
    video: true,
    audio: false,
  });

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

  // Handle photo capture and save
  const handleCapture = useCallback(async () => {
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
          }
        }
      }, 1000);
    } catch (err) {
      setError('Failed to save photo');
      console.error(err);
    }
  }, [mediaBlobUrl, stopRecording]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Photo Capture</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <video 
          id="video" 
          autoPlay 
          muted 
          className="w-full h-auto border rounded"
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button 
          onClick={startRecording}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Camera
        </button>
        <button 
          onClick={handleCapture}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Capture Photo
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2 text-black">Saved Photos</h2>
        {photoList.length === 0 ? (
          <p className='text-black'>No photos saved yet</p>
        ) : (
          <ul className="space-y-2">
            {photoList.map((photo, index) => (
              <li 
                key={index} 
                className="bg-gray-100 p-2 rounded "
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