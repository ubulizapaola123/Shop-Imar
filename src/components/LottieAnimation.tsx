"use client";

import { useEffect } from "react";

export default function LottieEmbed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://creattie.com/js/embed.js?id=3f6954fde297cd31b441";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <creattie-embed
      src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/136031/uuI3YYda2az8jMWl.json"
      delay="1"
      speed="100"
      frame_rate="24"
      trigger="loop"
      style={{ width: "100px", backgroundColor: "#ffffff" }}
    ></creattie-embed>
  );
}
