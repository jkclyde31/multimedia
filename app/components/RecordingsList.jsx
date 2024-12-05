'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileAudio, Trash2 } from 'lucide-react';
import { listRecordings } from '@/lib/fileUtils';

export default function RecordingsList() {
  const [recordings, setRecordings] = useState([]);
  const [expandedRecordings, setExpandedRecordings] = useState({});

  // Fetch recordings and update state
  const fetchRecordings = async () => {
    try {
      const fetchedRecordings = await listRecordings();
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Toggle recording details
  const toggleRecording = (filename) => {
    setExpandedRecordings(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  // Delete recording (placeholder - implement actual deletion logic)
  const handleDeleteRecording = async (filename) => {
    try {
      // Implement deletion logic here
      console.log(`Deleting recording: ${filename}`);
      // After successful deletion, refresh the list
      await fetchRecordings();
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  return (
    <div className="space-y-2">
      {recordings.length === 0 ? (
        <p className="text-gray-500 text-center">No recordings found.</p>
      ) : (
        recordings.map((recording) => (
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
        ))
      )}
    </div>
  );
}