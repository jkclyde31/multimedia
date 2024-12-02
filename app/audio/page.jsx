'use client'

import AudioRecorder from "../components/AudioRecorder";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className=" w-[95%] md:w-full max-w-md bg-white shadow-md rounded-lg p-6 ">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Audio Recorder</h1>
        <AudioRecorder />
      </div>
    </div>
  );
}