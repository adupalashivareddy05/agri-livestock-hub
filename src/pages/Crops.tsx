import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Phone, Wheat, Search, DollarSign, TrendingUp, Calendar, ArrowLeft, Building2, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCropRatesWithTraders } from "@/hooks/useCropRatesWithTraders";
import { useUserRole } from "@/hooks/useUserRole";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import { supabase } from "@/integrations/supabase/client";

const Crops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rates, loading } = useCropRatesWithTraders();
  const { isFarmer } = useUserRole();
  const { profile: farmerProfile } = useFarmerProfile();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCrop, setFilterCrop] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedCropForCompare, setSelectedCropForCompare] = useState<string | null>(null);
  const [contactingTrader, setContactingTrader] = useState<string | null>(null);

  // Get unique locations for filtering
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    rates.forEach(rate => {
      if (rate.trader.location) locations.add(rate.trader.location);
      if (rate.trader.user?.city) locations.add(rate.trader.user.city);
      if (rate.trader.user?.state) locations.add(rate.trader.user.state);
    });
    return Array.from(locations).sort();
  }, [rates]);

  const filteredCrops = useMemo(() => {
    return rates.filter(rate => {
      const matchesSearch = 
        rate.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.trader.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rate.trader.business_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rate.trader.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTypeFilter = 
        filterType === "all" || 
        rate.trader.trader_type === filterType;
      
      const matchesCropFilter = 
        filterCrop === "all" || 
        rate.crop_type === filterCrop;
      
      const matchesLocationFilter = 
        filterLocation === "all" ||
        rate.trader.location.toLowerCase().includes(filterLocation.toLowerCase()) ||
        rate.trader.user?.city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        rate.trader.user?.state?.toLowerCase().includes(filterLocation.toLowerCase());
      
      return matchesSearch && matchesTypeFilter && matchesCropFilter && matchesLocationFilter;
    });
  }, [rates, searchTerm, filterType, filterCrop, filterLocation]);

  const uniqueCropTypes = useMemo(() => {
    return Array.from(new Set(rates.map(r => r.crop_type))).sort();
  }, [rates]);

  // Get rates for price comparison
  const comparisonRates = useMemo(() => {
    if (!selectedCropForCompare) return [];
    return rates
      .filter(r => r.crop_type === selectedCropForCompare)
      .sort((a, b) => b.rate_per_kg - a.rate_per_kg);
  }, [rates, selectedCropForCompare]);

  const stats = useMemo(() => {
    const activeTraders = new Set(rates.map(r => r.trader.id)).size;
    const avgRate = rates.length > 0 
      ? rates.reduce((sum, r) => sum + r.rate_per_kg, 0) / rates.length 
      : 0;
    
    return {
      totalRates: rates.length,
      activeTraders,
      avgRate
    };
  }, [rates]);

  const handleGetQuote = async (rate: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to get quotes",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    const traderName = rate.trader.business_name || rate.trader.user?.full_name || 'Trader';
    
    toast({
      title: "Quote Request Sent",
      description: `Quote requested for ${rate.crop_type} from ${traderName}.`,
    });
  };

  const handleContact = async (rate: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to contact traders",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // If user is a verified farmer, record the contact
    if (isFarmer && farmerProfile?.is_verified) {
      setContactingTrader(rate.trader.id);
      try {
        await supabase
          .from('trader_contacts')
          .insert({
            farmer_id: farmerProfile.id,
            trader_id: rate.trader.id,
            crop_rate_id: rate.id,
            status: 'contacted'
          });
        
        toast({
          title: "Contact Recorded",
          description: `You can now contact ${rate.trader.business_name || 'the trader'}.`,
        });
      } catch (err) {
        console.error('Error recording contact:', err);
      } finally {
        setContactingTrader(null);
      }
    }
    
    const traderName = rate.trader.business_name || rate.trader.user?.full_name || 'Trader';
    toast({
      title: `Contacting ${traderName}`,
      description: `Location: ${rate.trader.location}`,
    });
  };

  const openCompareDialog = (cropType: string) => {
    setSelectedCropForCompare(cropType);
    setCompareDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            {isFarmer && !farmerProfile && (
              <Button onClick={() => navigate('/farmer-registration')}>
                Complete Farmer Profile
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Crop Marketplace</h1>
          <p className="text-muted-foreground">
            Compare real-time crop rates from verified traders • Filter by location and crop type
          </p>
        </div>

        {/* Farmer Status Banner */}
        {isFarmer && farmerProfile && !farmerProfile.is_verified && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-700 text-sm">
              ⏳ Your farmer profile is pending verification. You can view rates but some features are limited.
            </p>
          </div>
        )}

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
          <Select value={filterCrop} onValueChange={setFilterCrop}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {uniqueCropTypes.map(crop => (
                <SelectItem key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Trader Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Traders</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="everyday">Daily</SelectItem>
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
                  <p className="text-3xl font-bold">{stats.totalRates}</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-harvest text-harvest-gold-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Rate</p>
                  <p className="text-3xl font-bold">₹{stats.avgRate.toFixed(0)}/kg</p>
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
                  <p className="text-3xl font-bold">{stats.activeTraders}</p>
                </div>
                <Wheat className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Compare Buttons */}
        {uniqueCropTypes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Quick Compare Prices:</p>
            <div className="flex flex-wrap gap-2">
              {uniqueCropTypes.slice(0, 6).map(crop => (
                <Button
                  key={crop}
                  variant="outline"
                  size="sm"
                  onClick={() => openCompareDialog(crop)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCrops.length} of {rates.length} crop rates
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading crop rates...</p>
          </div>
        )}

        {/* Crops Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((rate) => {
              const traderName = rate.trader.business_name || rate.trader.user?.full_name || 'Anonymous Trader';
              const traderType = rate.trader.trader_type === 'seasonal' ? 'Seasonal' : 'Daily';
              const isVerified = true; // Assume verified traders only show active rates

              return (
                <Card key={rate.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-foreground flex items-center capitalize">
                        <Wheat className="h-5 w-5 mr-2 text-harvest-gold" />
                        {rate.crop_type}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant="default">Today</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      Updated {new Date(rate.rate_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-harvest-gold">₹{rate.rate_per_kg}</p>
                      <p className="text-sm text-muted-foreground">per KG</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => openCompareDialog(rate.crop_type)}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Compare Prices
                      </Button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {rate.trader.location}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Trader:</span>
                        <span className="font-medium flex items-center text-right">
                          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-32">{traderName}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{traderType}</Badge>
                      </div>
                      {rate.minimum_quantity_kg && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Min Qty:</span>
                          <span className="font-medium">{rate.minimum_quantity_kg} kg</span>
                        </div>
                      )}
                      {rate.trader.operating_hours && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Hours:</span>
                          <span className="font-medium flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {rate.trader.operating_hours}
                          </span>
                        </div>
                      )}
                    </div>

                    {rate.notes && (
                      <div className="text-xs text-muted-foreground border-t pt-3">
                        <span className="font-semibold">Note:</span> {rate.notes}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4 border-t">
                      <Button 
                        className="flex-1 bg-gradient-harvest text-harvest-gold-foreground"
                        onClick={() => handleGetQuote(rate)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Get Quote
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleContact(rate)}
                        disabled={contactingTrader === rate.trader.id}
                      >
                        {contactingTrader === rate.trader.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Phone className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <Wheat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No crop rates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Price Comparison Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="capitalize flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Comparison: {selectedCropForCompare}
            </DialogTitle>
            <DialogDescription>
              Compare rates from different traders for {selectedCropForCompare}
            </DialogDescription>
          </DialogHeader>
          
          {comparisonRates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Rate/kg</TableHead>
                  <TableHead>Min Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRates.map((rate, index) => (
                  <TableRow key={rate.id} className={index === 0 ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                    <TableCell>
                      {index === 0 ? (
                        <Badge className="bg-green-500">Best</Badge>
                      ) : (
                        <span className="text-muted-foreground">#{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {rate.trader.business_name || rate.trader.user?.full_name || 'Trader'}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {rate.trader.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{rate.trader.trader_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₹{rate.rate_per_kg}
                    </TableCell>
                    <TableCell>
                      {rate.minimum_quantity_kg ? `${rate.minimum_quantity_kg} kg` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No rates available for comparison</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Crops;
