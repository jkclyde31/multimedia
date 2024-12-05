'use client';

import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { saveRecording, listRecordings } from '@/lib/fileUtils';
import { FileAudio, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AudioRecorderWithList() {
  const [error, setError] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [expandedRecordings, setExpandedRecordings] = useState({});

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
          
          // Refresh the recordings list
          fetchRecordings();
        } catch (err) {
          setError(`Error saving recording: ${err.message}`);
        }
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

  // Handle download of recorded blob
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
      // For now, this is a placeholder
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

        {/* Current Recording Preview */}
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
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecording(recording);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedRecordings[recording] ? (
                      <ChevronUp className="text-gray-600" />
                    ) : (
                      <ChevronDown className="text-gray-600" />
                    )}
                  </div>
                </div>
                
                {expandedRecordings[recording] && (
                  <div className="p-3 bg-white border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="font-medium">N/A</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium">N/A</p>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <a 
                        href={`/recordings/${recording}`} 
                        download
                        className="w-full text-center bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}