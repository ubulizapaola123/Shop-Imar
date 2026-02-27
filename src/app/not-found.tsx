"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.25; }
          50% { transform: scaleX(0.75); opacity: 0.1; }
        }
        .float-img { animation: float 4s ease-in-out infinite; }
        .shadow-pulse { animation: shadow-pulse 4s ease-in-out infinite; }
      `}</style>

      {/* Floating image + shadow */}
      <div className="relative flex flex-col items-center mb-10">
        <img
          src="/notfound.png"
          alt="404"
          className="float-img w-[560px] select-none"
        />
        <div className="shadow-pulse w-72 h-4 bg-black/20 rounded-full blur-md mt-1" />
      </div>

      {/* Text */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Oops, page not found
        </h1>
        <p className="text-gray-400 text-base">
          We looked everywhere — this page doesn't exist.
        </p>
      </div>

      {/* Button */}
      <Link href="/">
        <button
          style={{
            background: "linear-gradient(135deg, #FF6600 0%, #ff8533 100%)",
            boxShadow: "0 8px 24px rgba(255, 102, 0, 0.91)",
          }}
          className="group relative overflow-hidden text-white font-bold text-sm tracking-wide px-10 py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(255,102,0,0.45)] active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            ← Back to Dashboard
          </span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        </button>
      </Link>
    </div>
  );
}
