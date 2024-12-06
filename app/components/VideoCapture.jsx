'use client';

import React, { useEffect, useRef, useState } from 'react';
import { saveVideo, listVideos } from '@/lib/fileUtils';
import { Video, Check, X, Loader2 } from 'lucide-react';

export default function VideoCapture() {
  const [videoList, setVideoList] = useState([]);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Fetch existing videos when component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await listVideos();
        setVideoList(videos);
      } catch (err) {
        setError('Failed to fetch videos');
        console.error(err);
      }
    };

    fetchVideos();
  }, []);

  // Open camera stream
  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer back camera on mobile
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        
        // Store stream for later cleanup
        streamRef.current = stream;
        
        setCameraActive(true);

        // Setup media recorder
        const mediaRecorder = new MediaRecorder(stream, { 
          mimeType: 'video/webm;codecs=vp9' 
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          setCapturedVideo({ blob, url: videoUrl });
          chunksRef.current = [];
          setIsRecording(false);
        };
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current) {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const saveCapture = async () => {
    if (!capturedVideo) return;

    try {
      setIsLoading(true);
      // Generate a unique filename
      const fileName = `video_${new Date().toISOString()}.webm`;

      // Create FormData
      const formData = new FormData();
      formData.append('blob', capturedVideo.blob, fileName);
      formData.append('fileName', fileName);

      // Save video
      const result = await saveVideo(formData);

      if (result.success) {
        // Update video list 
        // Assumes result might return an object with filename and path
        const newVideo = result.filename 
          ? { filename: result.filename, path: result.path || result.filename }
          : fileName;
        
        setVideoList(prev => [newVideo, ...prev]);
        
        // Clear captured video
        setCapturedVideo(null);
      }
    } catch (err) {
      setError(`Video save failed: ${err.message}`);
      console.error('Video save error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const discardCapture = () => {
    // Revoke object URL to free memory
    if (capturedVideo?.url) {
      URL.revokeObjectURL(capturedVideo.url);
    }
    setCapturedVideo(null);
    startCamera();
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      streamRef.current = null;
      setCameraActive(false);
      setIsRecording(false);
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
      <h1 className="text-2xl font-bold mb-4 text-black">Video Capture</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Video Preview or Captured Video */}
      <div className="mb-4 relative">
        {capturedVideo ? (
          <video 
            src={capturedVideo.url} 
            controls 
            className="w-full h-auto border rounded"
          />
        ) : (
          <video 
            ref={videoRef} 
            className="w-full h-auto border rounded"
            style={{ 
              display: cameraActive ? 'block' : 'none',
              backgroundColor: isRecording ? 'rgba(0,0,0,0.5)' : 'transparent'
            }}
          />
        )}

        {/* Recording Overlay */}
        {isRecording && !capturedVideo && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-xl">Recording...</div>
          </div>
        )}

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
        {!cameraActive && !capturedVideo && (
          <button 
            onClick={startCamera}
            disabled={isLoading}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <Video size={20} />
            <span>Open Camera</span>
          </button>
        )}

        {/* Camera Active State */}
        {cameraActive && !capturedVideo && !isRecording && (
          <button 
            onClick={startRecording}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
          >
            <Video size={20} />
            <span>Start Recording</span>
          </button>
        )}

        {/* Recording State */}
        {isRecording && (
          <button 
            onClick={stopRecording}
            disabled={isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            Stop Recording
          </button>
        )}

        {/* Captured Video State */}
        {capturedVideo && (
          <div className="flex space-x-4">
            <button 
              onClick={saveCapture}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
            >
              <Check size={20} />
              <span>Save Video</span>
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

      {/* Saved Videos List */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-black">Saved Videos</h2>
        {videoList.length === 0 ? (
          <p className='text-black'>No videos saved yet</p>
        ) : (
          <ul className="space-y-2">
            {videoList.map((video, index) => (
              <li 
                key={index} 
                className="bg-gray-100 p-2 rounded text-black flex justify-between items-center"
              >
                <span>
                  {/* Handle both string and object video items */}
                  {typeof video === 'object' 
                    ? (video.filename || video.path) 
                    : video
                  }
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}