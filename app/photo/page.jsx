'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const PhotoCapture = dynamic(() => import('../components/PhotoCapture'), {
  ssr: false
});

export default function AudioPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
       <Link href="/" className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Home
        </Link>
      <div className="w-[95%] md:w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <PhotoCapture />
      </div>
    </div>
  );
}