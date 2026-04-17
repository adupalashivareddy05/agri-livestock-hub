import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  MapPin, Phone, Search, ArrowLeft, Heart, Shield, 
  Calendar, Ruler, Droplets, Info, User, CheckCircle2, ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAnimals } from "@/hooks/useAnimals";
import holsteinCow from "@/assets/holstein-cow.jpg";

const BuyerAnimalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { animals, loading, error } = useAnimals();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [galleryAnimal, setGalleryAnimal] = useState<any | null>(null);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.animal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || animal.animal_type.toLowerCase() === filterType.toLowerCase();
    const matchesGender = filterGender === "all" || animal.gender.toLowerCase() === filterGender.toLowerCase();
    return matchesSearch && matchesType && matchesGender;
  });

  const formatAge = (years?: number, months?: number) => {
    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
    return parts.join(' ') || 'Not specified';
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
    return holsteinCow;
  };

  const getHealthStatus = (animal: any) => {
    if (animal.vaccination_details) {
      return { status: "Vaccinated", variant: "default" as const };
    }
    return { status: "Pending", variant: "secondary" as const };
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
    
    const phone = animal.contact_number;
    
    if (!phone) {
      toast({
        title: "Contact Unavailable",
        description: "Phone number not provided by seller",
        variant: "destructive",
      });
      return;
    }

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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading animals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-destructive mb-2">Error loading animals</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                🐄 Buyer Animal Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse and purchase quality livestock from verified sellers
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-sm py-1.5 px-3">
              {filteredAnimals.length} Animals Available
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border p-4 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by breed, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Animal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cow">Cow</SelectItem>
                <SelectItem value="buffalo">Buffalo</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="bull">Bull</SelectItem>
                <SelectItem value="ox">Ox</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Animal Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredAnimals.map((animal) => {
            const healthStatus = getHealthStatus(animal);
            
            return (
              <Card 
                key={animal.id} 
                className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative h-40 md:h-48 overflow-hidden bg-muted group">
                  <img 
                    src={getImageUrl(animal)} 
                    alt={`${animal.animal_type} - ${animal.breed}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setGalleryAnimal(animal)}
                  />
                  {animal.images && animal.images.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2 bg-background/80 backdrop-blur cursor-pointer"
                      onClick={() => setGalleryAnimal(animal)}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {animal.images.length} photo{animal.images.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFavorite(animal.id)}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 h-8 w-8"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Badge 
                    className="absolute top-2 left-2 capitalize"
                    variant={healthStatus.variant}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {healthStatus.status}
                  </Badge>
                </div>

                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="capitalize">{animal.animal_type}</span>
                    <span className="text-primary font-bold">{formatPrice(animal.price)}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">{animal.breed}</p>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatAge(animal.age_years, animal.age_months)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      <span className="capitalize">{animal.gender}</span>
                    </div>
                    {animal.body_height_cm && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Ruler className="h-3.5 w-3.5" />
                        <span>{animal.body_height_cm} cm</span>
                      </div>
                    )}
                    {animal.milk_capacity_liters && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Droplets className="h-3.5 w-3.5" />
                        <span>{animal.milk_capacity_liters}L/day</span>
                      </div>
                    )}
                  </div>

                  {/* Lactation Status */}
                  {animal.lactation_status && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Lactation:</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {animal.lactation_status}
                      </Badge>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{animal.location}</span>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t pt-2">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {animal.seller_profile?.full_name || 'Verified Seller'}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />
                  </div>

                  {/* Contact Button */}
                  <Button 
                    className="w-full bg-gradient-primary"
                    onClick={() => handleContact(animal)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAnimals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No animals found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterGender("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={!!galleryAnimal} onOpenChange={(open) => !open && setGalleryAnimal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {galleryAnimal?.animal_type} - {galleryAnimal?.breed}
            </DialogTitle>
          </DialogHeader>
          {galleryAnimal?.images && galleryAnimal.images.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {galleryAnimal.images.map((img: any, idx: number) => (
                  <CarouselItem key={idx}>
                    <div className="space-y-2">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={img.image_url}
                          alt={img.description || `Image ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="capitalize">
                          {img.image_type?.replace(/_/g, ' ') || 'Photo'}
                        </Badge>
                        <span className="text-muted-foreground">
                          {idx + 1} / {galleryAnimal.images.length}
                        </span>
                      </div>
                      {img.description && (
                        <p className="text-sm text-muted-foreground">{img.description}</p>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {galleryAnimal.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No images uploaded by seller</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerAnimalDashboard;
