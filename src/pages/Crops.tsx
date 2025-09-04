import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Wheat, Search, DollarSign, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Crops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Extended sample data
  const allCrops = [
    {
      id: 1,
      crop: "Cotton",
      rate: "₹6,200/quintal",
      change: "+2.5%",
      location: "Gujarat",
      trader: "Ahmedabad Traders",
      type: "Seasonal",
      season: "Kharif",
      quality: "Premium",
      minQuantity: "50 quintals",
      phone: "+91-99999-11111"
    },
    {
      id: 2,
      crop: "Wheat",
      rate: "₹2,150/quintal", 
      change: "+1.2%",
      location: "Punjab",
      trader: "Punjab Grain Co.",
      type: "Seasonal",
      season: "Rabi",
      quality: "Grade A",
      minQuantity: "100 quintals",
      phone: "+91-88888-22222"
    },
    {
      id: 3,
      crop: "Tomato",
      rate: "₹1,800/quintal",
      change: "-0.8%", 
      location: "Maharashtra",
      trader: "Fresh Veggie Co.",
      type: "Daily",
      season: "All Season",
      quality: "Fresh",
      minQuantity: "10 quintals",
      phone: "+91-77777-33333"
    },
    {
      id: 4,
      crop: "Rice",
      rate: "₹2,800/quintal",
      change: "+3.1%",
      location: "West Bengal",
      trader: "Bengal Rice Mills",
      type: "Seasonal",
      season: "Kharif",
      quality: "Basmati",
      minQuantity: "75 quintals",
      phone: "+91-66666-44444"
    },
    {
      id: 5,
      crop: "Onion",
      rate: "₹2,500/quintal",
      change: "+5.2%",
      location: "Maharashtra",
      trader: "Nashik Onion Traders",
      type: "Daily",
      season: "All Season",
      quality: "Premium",
      minQuantity: "20 quintals",
      phone: "+91-55555-55555"
    },
    {
      id: 6,
      crop: "Sugarcane",
      rate: "₹350/quintal",
      change: "+1.8%",
      location: "Uttar Pradesh",
      trader: "UP Sugar Mills",
      type: "Seasonal",
      season: "All Year",
      quality: "High Sugar",
      minQuantity: "200 quintals",
      phone: "+91-44444-66666"
    }
  ];

  const filteredCrops = allCrops.filter(crop => {
    const matchesSearch = crop.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.trader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || crop.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleGetQuote = (crop: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to get quotes",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Quote Request",
      description: `Quote requested for ${crop.crop} from ${crop.trader}. Contact: ${crop.phone}`,
    });
  };

  const handleContact = (crop: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to contact traders",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Contact Information",
      description: `Contact ${crop.trader} at ${crop.phone}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Crop Marketplace</h1>
          <p className="text-muted-foreground">Real-time crop rates from verified traders across India</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops, traders, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Rates</p>
                  <p className="text-3xl font-bold">{allCrops.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-harvest text-harvest-gold-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Price Change</p>
                  <p className="text-3xl font-bold">+2.1%</p>
                </div>
                <DollarSign className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-fresh text-fresh-green-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Traders</p>
                  <p className="text-3xl font-bold">6</p>
                </div>
                <Wheat className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCrops.length} of {allCrops.length} crop rates
          </p>
        </div>

        {/* Crops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <Card key={crop.id} className="shadow-soft hover:shadow-medium transition-shadow">
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
                <CardDescription className="text-muted-foreground">
                  Updated today
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-harvest-gold">{crop.rate}</p>
                  <p className="text-sm text-muted-foreground">Current Rate</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {crop.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trader:</span>
                    <span className="font-medium">{crop.trader}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{crop.type}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quality:</span>
                    <Badge variant="secondary">{crop.quality}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Min Qty:</span>
                    <span className="font-medium">{crop.minQuantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Season:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {crop.season}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-gradient-harvest text-harvest-gold-foreground"
                    onClick={() => handleGetQuote(crop)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Quote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContact(crop)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <Wheat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No crop rates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Crops;