import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Wheat, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Agricultural landscape with crops and livestock" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-fresh-green/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Connect Farmers
          <br />
          <span className="text-harvest-gold">& Traders</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
          The complete agricultural marketplace for livestock and crop trading. 
          Buy, sell, and trade with confidence in our trusted platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-medium">
            <Users className="h-5 w-5 mr-2" />
            Trade Animals
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            <Wheat className="h-5 w-5 mr-2" />
            Trade Crops
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-harvest-gold mb-2">500+</div>
            <div className="text-white/80">Active Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-harvest-gold mb-2">1000+</div>
            <div className="text-white/80">Livestock Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-harvest-gold mb-2">50+</div>
            <div className="text-white/80">Crop Varieties</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;