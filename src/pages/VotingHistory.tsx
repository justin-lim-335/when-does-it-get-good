// src/pages/History.tsx
export default function History() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Watch History</h1>
      <p className="text-gray-600 mb-6">
        Here you’ll be able to view your watch history and track the shows you’ve interacted with.
      </p>

      <div className="bg-gray-100 p-6 rounded-md shadow-inner text-gray-500">
        <p>No history yet. Start watching to see your activity appear here!</p>
      </div>
    </div>
  );
}
