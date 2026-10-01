import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Floating image + shadow */}
      <div className="relative flex flex-col items-center mb-10">
        <img
          src="/notfound.png"
          alt="404"
          className="w-[420px] max-w-full select-none"
        />
      </div>

      {/* Text */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Oops, page not found
        </h1>
        <p className="text-gray-500 text-sm">
          We looked everywhere — this page doesn&apos;t exist.
        </p>
      </div>

      {/* Button */}
      <Link href="/">
        <button
          className="group relative overflow-hidden text-white font-bold text-sm tracking-wide px-8 py-3 rounded-full transition-all duration-300 bg-[#15803D] hover:bg-[#166534] shadow-md hover:shadow-lg active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            ← Back to Dashboard
          </span>
        </button>
      </Link>
    </div>
  );
}
