import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import agriconnectLogo from "@/assets/agriconnect-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");

  useEffect(() => {
    // Phase 1: Enter animation (0-1.5s)
    const enterTimer = setTimeout(() => setPhase("visible"), 100);
    
    // Phase 2: Start exit animation after 7 seconds
    const exitTimer = setTimeout(() => setPhase("exiting"), 7000);
    
    // Phase 3: Navigate after 8 seconds (1s for exit animation)
    const redirectTimer = setTimeout(() => {
      navigate("/home");
    }, 8000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div 
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Title: AGRICONNECT */}
        <h1 
          className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-[0.3em] md:tracking-[0.4em] text-white mb-8 md:mb-12 transition-all duration-[2000ms] ease-out ${
            phase !== "entering" 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-8"
          }`}
          style={{ 
            textShadow: "0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.1)",
            transitionDelay: "300ms"
          }}
        >
          AGRICONNECT
        </h1>

        {/* Logo with glow effect */}
        <div 
          className={`relative transition-all duration-[2500ms] ease-out ${
            phase !== "entering" 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-75"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          {/* Outer glow */}
          <div 
            className="absolute inset-0 blur-3xl opacity-40 animate-pulse"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
              transform: "scale(1.5)"
            }}
          />
          
          {/* Logo image */}
          <img 
            src={agriconnectLogo} 
            alt="AGRICONNECT Logo" 
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain relative z-10 drop-shadow-2xl"
            style={{
              filter: "invert(1) brightness(1.2) drop-shadow(0 0 30px rgba(255,255,255,0.5))"
            }}
          />
          
          {/* Inner glow ring */}
          <div 
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              boxShadow: "0 0 60px 20px rgba(255,255,255,0.3), inset 0 0 60px 20px rgba(255,255,255,0.1)"
            }}
          />
        </div>

        {/* Welcome text */}
        <p 
          className={`mt-10 md:mt-14 text-sm md:text-lg lg:text-xl font-bold tracking-[0.2em] md:tracking-[0.3em] text-center text-white/90 transition-all duration-[2000ms] ease-out ${
            phase !== "entering" 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          }`}
          style={{ 
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
            transitionDelay: "1200ms"
          }}
        >
          SALAAR DEVARATHA RAISAR WELCOMES YOU
        </p>
      </div>

      {/* Subtle particles/dust effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
