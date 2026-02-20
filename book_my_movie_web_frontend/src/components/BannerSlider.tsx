import React, { useEffect, useState } from "react";

const banners = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
  "/banners/banner4.jpg",
];

const BannerSlider: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const prev = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div style={container}>
      {/* ⬅ Left Arrow */}
      <button style={{ ...arrow, left: "10px" }} onClick={prev}>
        ‹
      </button>

      {/* Slider */}
      <div style={viewport}>
        <div
          style={{
            ...track,
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {banners.map((banner, i) => (
            <img key={i} src={banner} alt="banner" style={image} />
          ))}
        </div>
      </div>

      {/* ➡ Right Arrow */}
      <button style={{ ...arrow, right: "10px" }} onClick={next}>
        ›
      </button>
    </div>
  );
};

const container: React.CSSProperties = {
  position: "relative",
  maxWidth: "1200px",
  margin: "30px auto",
};

const viewport: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: "14px",
  height: "300px",
};

const track: React.CSSProperties = {
  display: "flex",
  transition: "transform 0.6s ease-in-out",
  height: "100%",
};

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  flexShrink: 0,
};

const arrow: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  background: "rgba(255,255,255,0.9)",
  border: "none",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  fontSize: "26px",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
};

export default BannerSlider;
