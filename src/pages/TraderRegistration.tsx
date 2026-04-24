import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useTraderProfile } from '@/hooks/useTraderProfile';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Store, MapPin, CheckCircle2, Clock, Loader2 } from 'lucide-react';

const traderSchema = z.object({
  trader_type: z.string().min(1, "Trader type is required"),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  business_name: z.string().trim().max(100, "Business name must be less than 100 characters").optional().or(z.literal('')),
  license_number: z.string().trim().max(50, "License number must be less than 50 characters").optional().or(z.literal('')),
  operating_hours: z.string().trim().max(100, "Operating hours must be less than 100 characters").optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal(''))
});

const cropSpecializations = {
  seasonal: ['Cotton', 'Paddy', 'Maize', 'Groundnut', 'Wheat', 'Rice'],
  everyday: ['Tomato', 'Onion', 'Potato', 'Vegetables', 'Fruits', 'Leafy Greens']
};

const TraderRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTrader, hasRole, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading, createProfile, updateProfile } = useTraderProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    trader_type: '',
    location: '',
    business_name: '',
    license_number: '',
    operating_hours: '',
    specialization: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isSeasonal = hasRole('seasonal_trader');
  const isEveryday = hasRole('everyday_trader');

  useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/auth?redirect=/trader-registration');
    }
    if (!roleLoading && user && !isTrader) {
      toast({
        title: "Access Denied",
        description: "You need to register as a trader first.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isTrader, roleLoading, navigate]);

  useEffect(() => {
    if (!roleLoading) {
      const defaultType = isSeasonal ? 'seasonal' : isEveryday ? 'everyday' : '';
      setFormData(prev => ({ ...prev, trader_type: profile?.trader_type || defaultType }));
    }
  }, [roleLoading, isSeasonal, isEveryday, profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        trader_type: profile.trader_type || '',
        location: profile.location || '',
        business_name: profile.business_name || '',
        license_number: profile.license_number || '',
        operating_hours: profile.operating_hours || '',
        specialization: profile.specialization?.join(', ') || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = traderSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        trader_type: formData.trader_type,
        location: formData.location,
        business_name: formData.business_name || undefined,
        license_number: formData.license_number || undefined,
        operating_hours: formData.operating_hours || undefined,
        specialization: formData.specialization ? formData.specialization.split(',').map(s => s.trim()).filter(Boolean) : undefined
      };

      if (profile) {
        await updateProfile(data);
      } else {
        await createProfile(data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (roleLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableSpecializations = formData.trader_type === 'seasonal' 
    ? cropSpecializations.seasonal 
    : cropSpecializations.everyday;

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4">
            <Store className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Trader Profile</h1>
          <p className="text-muted-foreground">
            {profile ? 'Manage your trader profile' : 'Complete your trader registration'}
          </p>
        </div>

        {profile && (
          <div className="mb-6 flex justify-center gap-2">
            <Badge variant="outline" className="capitalize">
              {profile.trader_type} Trader
            </Badge>
            {profile.is_verified ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Pending Verification
              </Badge>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Business Details
            </CardTitle>
            <CardDescription>
              Provide your business details to help farmers find you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trader_type">Trader Type *</Label>
                <Select 
                  value={formData.trader_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trader_type: value }))}
                  disabled={!!profile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trader type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">Seasonal Trader (Cotton, Paddy, etc.)</SelectItem>
                    <SelectItem value="everyday">Everyday Trader (Vegetables, etc.)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.trader_type === 'seasonal' 
                    ? 'Seasonal traders procure specific crops like cotton, paddy, maize' 
                    : formData.trader_type === 'everyday'
                    ? 'Everyday traders procure vegetables and regular crops'
                    : 'Select your trader type based on crops you procure'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  placeholder="Your business or shop name"
                  value={formData.business_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Market Address *</Label>
                <Input
                  id="location"
                  placeholder="Market or shop location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    placeholder="Trading license number"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Input
                    id="operating_hours"
                    placeholder="e.g., 8 AM - 6 PM"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, operating_hours: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Crop Specializations</Label>
                <Input
                  id="specialization"
                  placeholder={`e.g., ${availableSpecializations.slice(0, 3).join(', ')}`}
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Common: {availableSpecializations.join(', ')}
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {profile ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  profile ? 'Update Profile' : 'Submit for Verification'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!profile && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            After verification, you can post crop buying rates and connect with farmers.
          </p>
        )}

        {profile?.is_verified && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/trader-rates')}
            >
              Manage Crop Rates
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraderRegistration;
