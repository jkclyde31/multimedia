'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const VideoCapture = dynamic(() => import('../components/VideoCapture'), {
  ssr: false
});

export default function AudioPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-[25px]">
      <div className="w-[95%] md:w-full max-w-md  mb-[20px]">
      <Link href="/" className="
        self-start
        shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(93,93,93,23%)] px-8 py-2 bg-[#fff] text-[#696969] rounded-md font-light transition duration-200 ease-linear">
          Back to Home
        </Link>
      </div>
    
      <div className="w-[95%] md:w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <VideoCapture />
      </div>
    </div>
  );
}