import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const animationTimer = setTimeout(() => setShowContent(true), 100);
    
    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/home");
    }, 5000);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic overlay effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50" />
      
      {/* Logo container with animations */}
      <div 
        className={`relative z-10 flex flex-col items-center transition-all duration-1500 ease-out ${
          showContent 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-75"
        }`}
        style={{ transitionDuration: "1.5s" }}
      >
        {/* Logo placeholder - styled text logo */}
        <div className="relative">
          <div className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-primary via-fresh-green to-emerald-600 flex items-center justify-center shadow-2xl shadow-primary/30">
            <div className="w-28 h-28 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-fresh-green to-emerald-400 bg-clip-text text-transparent">
                ARI
              </span>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>
        
        {/* App name */}
        <h1 
          className={`mt-8 text-2xl md:text-4xl lg:text-5xl font-bold tracking-widest text-white transition-all duration-1000 delay-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "0.5s" }}
        >
          <span className="bg-gradient-to-r from-primary via-fresh-green to-emerald-400 bg-clip-text text-transparent">
            ARI-CONNECT
          </span>
        </h1>
      </div>

      {/* Welcome text at bottom */}
      <div 
        className={`absolute bottom-16 md:bottom-20 left-0 right-0 flex justify-center transition-all duration-1000 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "1s" }}
      >
        <p className="text-sm md:text-lg lg:text-xl font-bold tracking-[0.2em] md:tracking-[0.3em] text-center px-4 animate-text-shimmer bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent bg-[length:200%_100%]">
          SALAAR DEVARATHA RAISAR WELCOMES YOU
        </p>
      </div>

      {/* Loading indicator */}
      <div 
        className={`absolute bottom-8 transition-all duration-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "1.5s" }}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
