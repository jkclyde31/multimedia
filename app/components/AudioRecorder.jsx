'use client';

import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { saveRecording, listRecordings } from '@/lib/fileUtils';
import { FileAudio, Trash2, Loader2, Check, X } from 'lucide-react';

export default function AudioRecorderWithList() {
  const [error, setError] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [expandedRecordings, setExpandedRecordings] = useState({});
  const [pendingRecording, setPendingRecording] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    mediaBlob
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      if (blob) {
        setPendingRecording({ blobUrl, blob });
      }
    },
    onError: (err) => {
      setError(err.message || 'An error occurred during recording');
    }
  });

  // Fetch recordings
  const fetchRecordings = async () => {
    try {
      const fetchedRecordings = await listRecordings();
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError(`Error fetching recordings: ${error.message}`);
    }
  };

  // Initial fetch of recordings
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Save the recording
  const saveCurrentRecording = async () => {
    if (!pendingRecording) return;

    setIsLoading(true);
    try {
      const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
      
      const formData = new FormData();
      formData.append('blob', pendingRecording.blob, fileName);
      formData.append('fileName', fileName);

      await saveRecording(formData);
      setError('');
      
      // Refresh the recordings list
      await fetchRecordings();
      
      // Clear pending recording
      setPendingRecording(null);
    } catch (err) {
      setError(`Error saving recording: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Discard the pending recording
  const discardRecording = () => {
    setPendingRecording(null);
  };

  // Handle download of recorded blob
  const handleDownload = () => {
    if (pendingRecording?.blobUrl) {
      const link = document.createElement('a');
      link.href = pendingRecording.blobUrl;
      link.download = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Toggle recording details
  const toggleRecording = (filename) => {
    setExpandedRecordings(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  // Delete recording 
  const handleDeleteRecording = async (filename) => {
    try {
      // TODO: Implement actual deletion logic in your fileUtils
      console.log(`Deleting recording: ${filename}`);
      
      // Refresh the recordings list
      await fetchRecordings();
    } catch (error) {
      console.error('Error deleting recording:', error);
      setError(`Error deleting recording: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4 bg-white shadow-md rounded-lg">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      {/* Recording Controls */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button 
            onClick={startRecording}
            disabled={status === 'recording' || pendingRecording !== null}
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

        {/* Pending Recording Preview */}
        {pendingRecording && (
          <div className="mt-4 space-y-2">
            <audio src={pendingRecording.blobUrl} controls className="w-full" />
            
            <div className="flex space-x-4">
              <button 
                onClick={saveCurrentRecording}
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center space-x-2"
              >
                <Check size={20} />
                <span>Save Recording</span>
              </button>
              
              <button 
                onClick={discardRecording}
                disabled={isLoading}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center space-x-2"
              >
                <X size={20} />
                <span>Discard</span>
              </button>
            </div>
{/* 
            <button 
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-2"
            >
              Download Recording
            </button> */}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={48} />
          </div>
        )}

        <div className="text-center text-gray-600">
          Current Status: {status}
        </div>
      </div>

      {/* Recordings List */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-4 text-black">Recorded Files</h2>
        {recordings.length === 0 ? (
          <p className="text-gray-500 text-center">No recordings found.</p>
        ) : (
          <div className="space-y-2">
            {recordings.map((recording) => (
              <div 
                key={recording} 
                className="bg-gray-100 rounded-lg shadow-sm overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleRecording(recording)}
                >
                  <div className="flex items-center space-x-2">
                    <FileAudio className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-800">{recording}</span>
                  </div>
                  
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}