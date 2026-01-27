const ScrollingBanner = () => {
  const bannerText = "🐝💧☀️ ŚÂVE FÂRMERŚ 🐝💧☀️";
  
  return (
    <div className="w-full bg-gradient-to-r from-fresh-green via-primary to-fresh-green overflow-hidden py-2">
      <div className="flex animate-scroll-banner">
        {/* Repeat the text multiple times for seamless loop */}
        {[...Array(8)].map((_, index) => (
          <span
            key={index}
            className="flex-shrink-0 mx-8 text-white font-bold text-lg md:text-xl tracking-wider whitespace-nowrap"
            style={{ fontFamily: "'Segoe UI', sans-serif" }}
          >
            {bannerText}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
