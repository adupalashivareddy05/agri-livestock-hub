import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Phone, ArrowLeft, Shield, Calendar, Ruler, Droplets, 
  User, CheckCircle2, Wheat, TrendingUp, Scale, Clock, Store
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import holsteinCow from "@/assets/holstein-cow.jpg";

// Types
interface Animal {
  id: string;
  animal_type: string;
  breed: string;
  gender: string;
  age_years?: number;
  age_months?: number;
  price: number;
  location: string;
  contact_number?: string;
  milk_capacity_liters?: number;
  lactation_status?: string;
  vaccination_details?: string;
  body_height_cm?: number;
  is_available: boolean;
  created_at: string;
  seller_id: string;
  seller_profile?: {
    full_name?: string;
    city?: string;
    state?: string;
  };
  images?: {
    image_url: string;
    image_type: string;
  }[];
}

interface CropRate {
  id: string;
  crop_type: string;
  rate_per_kg: number;
  minimum_quantity_kg: number | null;
  maximum_quantity_kg: number | null;
  rate_date: string;
  notes: string | null;
  trader: {
    id: string;
    business_name: string | null;
    trader_type: string;
    location: string;
    operating_hours: string | null;
    specialization: string[] | null;
    user: {
      full_name: string | null;
      city: string | null;
      state: string | null;
    } | null;
  };
}

const MarketDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch animals with auto-refresh every 30 seconds
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ['market-animals'],
    queryFn: async () => {
      const { data: animalsData, error } = await supabase
        .from('animals')
        .select(`*, images:animal_images(image_url, image_type)`)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sellerIds = animalsData?.map(a => a.seller_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (sellerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, city, state')
          .in('user_id', sellerIds);
        profiles = profilesData || [];
      }

      return animalsData?.map(animal => ({
        ...animal,
        seller_profile: profiles.find(p => p.user_id === animal.seller_id)
      })) || [];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch crop rates with auto-refresh every 30 seconds
  const { data: cropRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ['market-crop-rates'],
    queryFn: async () => {
      const { data: ratesData, error } = await supabase
        .from('crop_rates')
        .select(`*, traders!inner(id, business_name, trader_type, location, operating_hours, specialization, user_id)`)
        .eq('is_active', true)
        .order('rate_date', { ascending: false });

      if (error) throw error;

      const traderUserIds = Array.from(
        new Set(ratesData?.map((r: any) => r.traders?.user_id).filter(Boolean))
      );

      let profiles: any[] = [];
      if (traderUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, city, state')
          .in('user_id', traderUserIds);
        profiles = profilesData || [];
      }

      return ratesData?.map((rate: any) => ({
        id: rate.id,
        crop_type: rate.crop_type,
        rate_per_kg: rate.rate_per_kg,
        minimum_quantity_kg: rate.minimum_quantity_kg,
        maximum_quantity_kg: rate.maximum_quantity_kg,
        rate_date: rate.rate_date,
        notes: rate.notes,
        trader: {
          id: rate.traders?.id || '',
          business_name: rate.traders?.business_name || null,
          trader_type: rate.traders?.trader_type || 'everyday',
          location: rate.traders?.location || 'Unknown',
          operating_hours: rate.traders?.operating_hours || null,
          specialization: rate.traders?.specialization || null,
          user: profiles.find(p => p.user_id === rate.traders?.user_id) || null
        }
      })) || [];
    },
    refetchInterval: 30000,
  });

  const isLoading = animalsLoading || ratesLoading;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatAge = (years?: number, months?: number) => {
    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
    return parts.join(' ') || 'Not specified';
  };

  const getImageUrl = (animal: Animal) => {
    if (animal.images && animal.images.length > 0) {
      return animal.images[0].image_url;
    }
    return holsteinCow;
  };

  const getHealthStatus = (animal: Animal) => {
    if (animal.vaccination_details) {
      return { status: "Vaccinated", variant: "default" as const };
    }
    return { status: "Pending", variant: "secondary" as const };
  };

  const formatCropName = (cropType: string) => {
    return cropType.charAt(0).toUpperCase() + cropType.slice(1);
  };

  const handleContactSeller = (phone?: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to contact sellers", variant: "destructive" });
      navigate('/auth');
      return;
    }
    if (!phone) {
      toast({ title: "Contact Unavailable", description: "Phone number not provided", variant: "destructive" });
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading market data...</p>
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
                📊 Market Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Live crop rates and livestock listings • Auto-updates every 30 seconds
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="py-1.5 px-3">
                <Wheat className="h-3.5 w-3.5 mr-1" />
                {cropRates.length} Crop Rates
              </Badge>
              <Badge variant="outline" className="py-1.5 px-3">
                🐄 {animals.length} Animals
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Listings</TabsTrigger>
            <TabsTrigger value="crops">Crop Rates</TabsTrigger>
            <TabsTrigger value="animals">Livestock</TabsTrigger>
          </TabsList>

          {/* All Listings Tab */}
          <TabsContent value="all" className="space-y-8">
            {/* Crop Rates Section */}
            {cropRates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-primary" />
                  Latest Crop Buying Rates
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cropRates.slice(0, 4).map((rate) => (
                    <CropRateCard key={rate.id} rate={rate} />
                  ))}
                </div>
              </div>
            )}

            {/* Animals Section */}
            {animals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🐄 Latest Livestock Listings
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {animals.slice(0, 4).map((animal: Animal) => (
                    <AnimalCard 
                      key={animal.id} 
                      animal={animal}
                      onContact={() => handleContactSeller(animal.contact_number)}
                      getImageUrl={getImageUrl}
                      getHealthStatus={getHealthStatus}
                      formatAge={formatAge}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            )}

            {cropRates.length === 0 && animals.length === 0 && (
              <EmptyState message="No listings available yet" />
            )}
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops">
            {cropRates.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cropRates.map((rate) => (
                  <CropRateCard key={rate.id} rate={rate} />
                ))}
              </div>
            ) : (
              <EmptyState message="No crop rates available" />
            )}
          </TabsContent>

          {/* Animals Tab */}
          <TabsContent value="animals">
            {animals.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {animals.map((animal: Animal) => (
                  <AnimalCard 
                    key={animal.id} 
                    animal={animal}
                    onContact={() => handleContactSeller(animal.contact_number)}
                    getImageUrl={getImageUrl}
                    getHealthStatus={getHealthStatus}
                    formatAge={formatAge}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No animals listed" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Crop Rate Card Component
const CropRateCard = ({ rate }: { rate: CropRate }) => {
  const formatCropName = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);
  
  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="capitalize">
            <Wheat className="h-3 w-3 mr-1" />
            {formatCropName(rate.crop_type)}
          </Badge>
          <Badge className="bg-primary text-primary-foreground">
            {rate.trader.trader_type === 'seasonal' ? 'Seasonal' : 'Daily'}
          </Badge>
        </div>
        <CardTitle className="text-2xl text-primary mt-2">
          ₹{rate.rate_per_kg}/kg
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {/* Quantity Range */}
        {(rate.minimum_quantity_kg || rate.maximum_quantity_kg) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            <span>
              {rate.minimum_quantity_kg && `Min: ${rate.minimum_quantity_kg}kg`}
              {rate.minimum_quantity_kg && rate.maximum_quantity_kg && ' • '}
              {rate.maximum_quantity_kg && `Max: ${rate.maximum_quantity_kg}kg`}
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{rate.trader.location}</span>
        </div>

        {/* Operating Hours */}
        {rate.trader.operating_hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{rate.trader.operating_hours}</span>
          </div>
        )}

        {/* Rate Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Updated: {new Date(rate.rate_date).toLocaleDateString()}</span>
        </div>

        {/* Trader Info */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <Store className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium truncate">
              {rate.trader.business_name || rate.trader.user?.full_name || 'Verified Trader'}
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />
          </div>
          {rate.trader.user?.city && (
            <p className="text-xs text-muted-foreground mt-1 ml-5">
              {rate.trader.user.city}, {rate.trader.user.state}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Animal Card Component
const AnimalCard = ({ 
  animal, 
  onContact,
  getImageUrl,
  getHealthStatus,
  formatAge,
  formatPrice
}: { 
  animal: Animal;
  onContact: () => void;
  getImageUrl: (animal: Animal) => string;
  getHealthStatus: (animal: Animal) => { status: string; variant: "default" | "secondary" };
  formatAge: (years?: number, months?: number) => string;
  formatPrice: (price: number) => string;
}) => {
  const healthStatus = getHealthStatus(animal);
  
  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden bg-muted">
        <img 
          src={getImageUrl(animal)} 
          alt={`${animal.animal_type} - ${animal.breed}`}
          className="w-full h-full object-cover"
        />
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
          <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
            {animal.gender}
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
        <Button className="w-full" onClick={onContact}>
          <Phone className="h-4 w-4 mr-2" />
          Contact Seller
        </Button>
      </CardContent>
    </Card>
  );
};

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <TrendingUp className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{message}</h3>
    <p className="text-muted-foreground">Check back later for new listings</p>
  </div>
);

export default MarketDashboard;
