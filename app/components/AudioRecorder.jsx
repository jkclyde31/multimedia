'use client';

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { saveRecording } from '@/lib/fileUtils';


export default function AudioRecorder() {
  const [error, setError] = useState('');
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      if (blob) {
        const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
        
        try {
          const formData = new FormData();
          formData.append('blob', blob, fileName);
          formData.append('fileName', fileName);

          await saveRecording(formData);
          setError('');
        } catch (err) {
          setError(`Error saving recording: ${err.message}`);
        }
      }
    },
    onError: (err) => {
      setError(err.message || 'An error occurred during recording');
    }
  });

  const handleDownload = () => {
    if (mediaBlobUrl) {
      const link = document.createElement('a');
      link.href = mediaBlobUrl;
      link.download = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4 ">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <button 
          onClick={startRecording}
          disabled={status === 'recording'}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Start Recording
        </button>
        
        <button 
          onClick={stopRecording}
          disabled={status !== 'recording'}
          className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop Recording
        </button>
      </div>

      {mediaBlobUrl && (
        <div className="mt-4 space-y-2">
          <audio src={mediaBlobUrl} controls className="w-full" />
          <button 
            onClick={handleDownload}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Download Recording
          </button>
        </div>
      )}

      <div className="text-center text-gray-600">
        Current Status: {status}
      </div>
    </div>
  );
}