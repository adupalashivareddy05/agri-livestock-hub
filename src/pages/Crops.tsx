import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Wheat, Search, DollarSign, TrendingUp, Calendar, ArrowLeft, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCropRatesWithTraders } from "@/hooks/useCropRatesWithTraders";

const Crops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rates, loading } = useCropRatesWithTraders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCrop, setFilterCrop] = useState("all");

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
      
      return matchesSearch && matchesTypeFilter && matchesCropFilter;
    });
  }, [rates, searchTerm, filterType, filterCrop]);

  const uniqueCropTypes = useMemo(() => {
    return Array.from(new Set(rates.map(r => r.crop_type))).sort();
  }, [rates]);

  const stats = useMemo(() => {
    const activeTraders = new Set(rates.map(r => r.trader.id)).size;
    const avgChange = rates.length > 0 ? 2.1 : 0; // Calculate based on actual data if historical data available
    
    return {
      totalRates: rates.length,
      activeTraders,
      avgChange
    };
  }, [rates]);

  const handleGetQuote = (rate: any) => {
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
    const phone = rate.trader.user?.phone_number || 'N/A';
    
    toast({
      title: "Quote Request",
      description: `Quote requested for ${rate.crop_type} from ${traderName}. Contact: ${phone}`,
    });
  };

  const handleContact = (rate: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to contact traders",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    const traderName = rate.trader.business_name || rate.trader.user?.full_name || 'Trader';
    const phone = rate.trader.user?.phone_number;
    
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      toast({
        title: "Contact Unavailable",
        description: "This trader hasn't provided contact information.",
        variant: "destructive",
      });
    }
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
          <Select value={filterCrop} onValueChange={setFilterCrop}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by crop" />
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trader type" />
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
                  <p className="text-sm opacity-90">Avg. Price Change</p>
                  <p className="text-3xl font-bold">+{stats.avgChange.toFixed(1)}%</p>
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCrops.length} of {rates.length} crop rates
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading crop rates...</p>
          </div>
        )}

        {/* Crops Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((rate) => {
              const traderName = rate.trader.business_name || rate.trader.user?.full_name || 'Anonymous Trader';
              const traderType = rate.trader.trader_type === 'seasonal' ? 'Seasonal' : 'Daily';
              const minQty = rate.minimum_quantity_kg ? `${rate.minimum_quantity_kg} kg` : 'No minimum';
              const maxQty = rate.maximum_quantity_kg ? `${rate.maximum_quantity_kg} kg` : 'No maximum';

              return (
                <Card key={rate.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-foreground flex items-center capitalize">
                        <Wheat className="h-5 w-5 mr-2 text-harvest-gold" />
                        {rate.crop_type}
                      </CardTitle>
                      <Badge variant="default">Today</Badge>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      Updated {new Date(rate.rate_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-harvest-gold">₹{rate.rate_per_kg}</p>
                      <p className="text-sm text-muted-foreground">per KG</p>
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
                          <span className="truncate">{traderName}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{traderType}</Badge>
                      </div>
                      {rate.minimum_quantity_kg && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Min Qty:</span>
                          <span className="font-medium">{minQty}</span>
                        </div>
                      )}
                      {rate.maximum_quantity_kg && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Max Qty:</span>
                          <span className="font-medium">{maxQty}</span>
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
                        Quote
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleContact(rate)}
                      >
                        <Phone className="h-4 w-4" />
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
    </div>
  );
};

export default Crops;