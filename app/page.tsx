import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-start justify-center pt-4 px-4">
      <div className="w-full max-w-md">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gray-600 shrink-0"></div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-white">user123</p>
            </div>
          </div>
          <span className="text-sm text-gray-500 shrink-0">17:45</span>
        </div>

        {/* Image Placeholder */}
        <div className="w-full bg-linear-to-b from-gray-900 to-blue-900 rounded-xl flex items-center justify-center mb-6 aspect-square overflow-hidden">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 border-2 border-gray-500 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-gray-500"></div>
          </div>
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
          <button
            onClick={toggleLike}
            className="flex items-center transition-all duration-200 hover:scale-110 shrink-0"
          >
            <svg className="w-7 h-7" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" className={isLiked ? "text-red-500" : "text-gray-400"} />
            </svg>
          </button>
          <span className="text-sm text-gray-300 flex-1">Description about this rare moment</span>
          <div className="flex items-center gap-2 text-gray-400 shrink-0">
            <span className="text-sm">◆</span>
            <span className="text-sm font-medium">0.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}