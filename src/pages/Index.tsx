import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TradingSections from "@/components/TradingSections";
import UserRoles from "@/components/UserRoles";
import ScrollingBanner from "@/components/ScrollingBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollingBanner />
      <Header />
      <HeroSection />
      <TradingSections />
      <UserRoles />
    </div>
  );
};

export default Index;
