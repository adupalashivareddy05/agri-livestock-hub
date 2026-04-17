import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Star, Heart, Search, Filter, ArrowLeft, Plus, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAnimals } from "@/hooks/useAnimals";
import AnimalImageGallery from "@/components/AnimalImageGallery";
import holsteinCow from "@/assets/holstein-cow.jpg";

const Animals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { animals, loading, error } = useAnimals();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.animal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || animal.animal_type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const formatAge = (years?: number, months?: number) => {
    const parts = [];
    if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    return parts.join(' ') || 'Age not specified';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (animal: any) => {
    if (animal.images && animal.images.length > 0) {
      return animal.images[0].image_url;
    }
    return holsteinCow; // Fallback image
  };

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
    
    const sellerName = animal.seller_profile?.full_name || 'Seller';
    const phone = animal.contact_number;
    
    if (!phone) {
      toast({
        title: "Contact Information Unavailable",
        description: "Phone number not provided by seller",
        variant: "destructive",
      });
      return;
    }

    // Open phone dialer
    window.location.href = `tel:${phone}`;
  };

  const handleFavorite = (animalId: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
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
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">Error loading animals</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing {filteredAnimals.length} of {animals.length} animals
          </p>
          {user && (
            <Button 
              onClick={() => navigate('/add-animal')}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Animal
            </Button>
          )}
        </div>

        {/* Animal Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={getImageUrl(animal)} 
                  alt={`${animal.animal_type} - ${animal.breed}`}
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
                </div>
              </div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary" />
                      {animal.animal_type} - {animal.breed}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {animal.gender} • {formatAge(animal.age_years, animal.age_months)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {animal.milk_capacity_liters && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Milk Capacity:</span>
                      <p className="font-medium text-foreground">{animal.milk_capacity_liters}L/day</p>
                    </div>
                    {animal.lactation_status && (
                      <div>
                        <span className="text-muted-foreground">Lactation:</span>
                        <Badge variant={animal.lactation_status === "lactating" ? "default" : "secondary"}>
                          {animal.lactation_status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {animal.location}
                </div>

                {animal.vaccination_details && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground mr-2">Vaccination:</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Vaccinated
                      </Badge>
                    </div>
                    {animal.images?.find((img: any) => img.image_type === 'vaccination') && (
                      <div className="text-xs text-muted-foreground">
                        📋 Certificate available
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatPrice(animal.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      By {animal.seller_profile?.full_name || 'Seller'}
                    </p>
                    {user && animal.contact_number && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {animal.contact_number}
                      </p>
                    )}
                  </div>
                  <Button 
                    className="bg-gradient-primary"
                    onClick={() => handleContact(animal)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
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