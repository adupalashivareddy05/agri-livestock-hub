import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Heart, Wheat, Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const TradingSections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleButtonClick = (action: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to access this feature",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Feature Coming Soon",
      description: `${action} feature is being developed`,
    });
  };
  // Sample animal listings
  const animalListings = [
    {
      id: 1,
      type: "Dairy Cow",
      breed: "Holstein Friesian",
      gender: "Female",
      age: "3 years",
      milkCapacity: "25L/day",
      lactation: "High",
      location: "Punjab, India",
      price: "₹85,000",
      seller: "Rajesh Kumar",
      phone: "+91-98765-43210",
      vaccination: "Complete",
      rating: 4.8
    },
    {
      id: 2,
      type: "Buffalo",
      breed: "Murrah",
      gender: "Female", 
      age: "4 years",
      milkCapacity: "18L/day",
      lactation: "Medium",
      location: "Haryana, India",
      price: "₹75,000",
      seller: "Suresh Singh",
      phone: "+91-87654-32109",
      vaccination: "Complete",
      rating: 4.6
    }
  ];

  // Sample crop rates
  const cropRates = [
    {
      crop: "Cotton",
      rate: "₹6,200/quintal",
      change: "+2.5%",
      location: "Gujarat",
      trader: "Ahmedabad Traders",
      type: "Seasonal",
      season: "Kharif"
    },
    {
      crop: "Wheat",
      rate: "₹2,150/quintal", 
      change: "+1.2%",
      location: "Punjab",
      trader: "Punjab Grain Co.",
      type: "Seasonal",
      season: "Rabi"
    },
    {
      crop: "Tomato",
      rate: "₹1,800/quintal",
      change: "-0.8%", 
      location: "Maharashtra",
      trader: "Fresh Veggie Co.",
      type: "Daily",
      season: "All Season"
    }
  ];

  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Animal Trading Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Animal Trading
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse high-quality livestock from verified sellers with detailed health and breed information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {animalListings.map((animal) => (
              <Card key={animal.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-foreground flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-primary" />
                        {animal.type} - {animal.breed}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {animal.gender} • {animal.age}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-harvest-gold mr-1" />
                      <span className="text-sm font-medium">{animal.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Milk Capacity:</span>
                      <p className="font-medium text-foreground">{animal.milkCapacity}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lactation:</span>
                      <Badge variant={animal.lactation === "High" ? "default" : "secondary"}>
                        {animal.lactation}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {animal.location}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-primary">{animal.price}</p>
                      <p className="text-sm text-muted-foreground">By {animal.seller}</p>
                    </div>
                    <Button 
                      className="bg-gradient-primary"
                      onClick={() => handleButtonClick('Contact seller')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleButtonClick('View all animals')}
            >
              View All Animals
            </Button>
          </div>
        </div>

        {/* Crop Trading Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Crop Trading
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get real-time crop rates from verified traders and merchants across different regions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cropRates.map((crop, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-foreground flex items-center">
                      <Wheat className="h-5 w-5 mr-2 text-harvest-gold" />
                      {crop.crop}
                    </CardTitle>
                    <Badge variant={crop.change.startsWith('+') ? "default" : "destructive"}>
                      {crop.change}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-harvest-gold">{crop.rate}</p>
                    <p className="text-sm text-muted-foreground">Current Rate</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{crop.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trader:</span>
                      <span className="font-medium">{crop.trader}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{crop.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Season:</span>
                      <span className="font-medium">{crop.season}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-harvest text-harvest-gold-foreground"
                    onClick={() => handleButtonClick('Get quote')}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-harvest-gold text-harvest-gold hover:bg-harvest-gold hover:text-harvest-gold-foreground"
              onClick={() => handleButtonClick('View all rates')}
            >
              View All Rates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSections;