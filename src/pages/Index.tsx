import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TradingSections from "@/components/TradingSections";
import UserRoles from "@/components/UserRoles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TradingSections />
      <UserRoles />
    </div>
  );
};

export default Index;
