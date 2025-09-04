import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Star, Heart, Search, Filter, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import holsteinCow from "@/assets/holstein-cow.jpg";
import murrahBuffalo from "@/assets/murrah-buffalo.jpg";
import boerGoat from "@/assets/boer-goat.jpg";
import girBull from "@/assets/gir-bull.jpg";

const Animals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Extended sample data
  const allAnimals = [
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
      rating: 4.8,
      image: holsteinCow
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
      rating: 4.6,
      image: murrahBuffalo
    },
    {
      id: 3,
      type: "Goat",
      breed: "Boer",
      gender: "Male",
      age: "2 years",
      milkCapacity: "N/A",
      lactation: "N/A",
      location: "Rajasthan, India",
      price: "₹25,000",
      seller: "Amit Sharma",
      phone: "+91-76543-21098",
      vaccination: "Complete",
      rating: 4.5,
      image: boerGoat
    },
    {
      id: 4,
      type: "Bull",
      breed: "Gir",
      gender: "Male",
      age: "5 years",
      milkCapacity: "N/A",
      lactation: "N/A",
      location: "Gujarat, India",
      price: "₹95,000",
      seller: "Kiran Patel",
      phone: "+91-65432-10987",
      vaccination: "Complete",
      rating: 4.9,
      image: girBull
    }
  ];

  const filteredAnimals = allAnimals.filter(animal => {
    const matchesSearch = animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || animal.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleContact = (animal: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to contact sellers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Contact Information",
      description: `Contact ${animal.seller} at ${animal.phone}`,
    });
  };

  const handleFavorite = (animalId: number) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to save favorites",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Added to Favorites",
      description: "Animal saved to your favorites",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Animal Marketplace</h1>
          <p className="text-muted-foreground">Browse quality livestock from verified sellers</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search animals, breeds, or locations..."
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
              <SelectItem value="all">All Animals</SelectItem>
              <SelectItem value="dairy cow">Dairy Cow</SelectItem>
              <SelectItem value="buffalo">Buffalo</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="bull">Bull</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAnimals.length} of {allAnimals.length} animals
          </p>
        </div>

        {/* Animal Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={animal.image} 
                  alt={`${animal.type} - ${animal.breed}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFavorite(animal.id)}
                    className="bg-white/80 hover:bg-white/90"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
                    <Star className="h-4 w-4 text-harvest-gold mr-1" />
                    <span className="text-sm font-medium">{animal.rating}</span>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary" />
                      {animal.type} - {animal.breed}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {animal.gender} • {animal.age}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {animal.milkCapacity !== "N/A" && (
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
                )}

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {animal.location}
                </div>

                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Vaccination:</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {animal.vaccination}
                  </Badge>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">{animal.price}</p>
                    <p className="text-sm text-muted-foreground">By {animal.seller}</p>
                  </div>
                  <Button 
                    className="bg-gradient-primary"
                    onClick={() => handleContact(animal)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No animals found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Animals;