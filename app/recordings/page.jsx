import { listRecordings } from "@/lib/fileUtils";
export default async function RecordingsPage() {
  const recordings = await listRecordings();


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Recorded Files</h1>
        {recordings.length === 0 ? (
          <p className="text-black">No recordings found.</p>
        ) : (
          <ul className="space-y-2">
            {recordings.map((recording, index) => (
              <li 
                key={index} 
                className="bg-gray-200 p-2 rounded flex justify-between items-center"
              >
                <span className="text-black">{recording}</span>
                <a 
                  href={`/recordings/${recording}`} 
                  download
                  className="text-blue-500 hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}