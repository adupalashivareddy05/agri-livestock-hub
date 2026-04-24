import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Leaf, CheckCircle2, Clock, Loader2, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const farmerSchema = z.object({
  farmer_name: z.string().trim().min(1, "Farmer name is required").max(100, "Name must be less than 100 characters"),
  phone_number: z.string().trim().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  village: z.string().trim().max(100, "Village must be less than 100 characters").optional().or(z.literal('')),
  district: z.string().trim().max(100, "District must be less than 100 characters").optional().or(z.literal('')),
  state: z.string().trim().min(1, "State is required").max(100, "State must be less than 100 characters"),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits").optional().or(z.literal('')),
  land_size_acres: z.string().optional().or(z.literal('')),
  crops_grown: z.string().optional().or(z.literal(''))
});

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFarmer, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading, createProfile, updateProfile } = useFarmerProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    farmer_name: '',
    phone_number: '',
    location: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    land_size_acres: '',
    crops_grown: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/auth?redirect=/farmer-registration');
    }
    if (!roleLoading && user && !isFarmer) {
      toast({
        title: "Access Denied",
        description: "You need to register as a farmer first.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isFarmer, roleLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        location: profile.location || '',
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        land_size_acres: profile.land_size_acres?.toString() || '',
        crops_grown: profile.crops_grown?.join(', ') || '',
      }));
    }
  }, [profile]);

  // Load farmer name & phone from profiles table (linked by user_id)
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setFormData(prev => ({
          ...prev,
          farmer_name: data.full_name || '',
          phone_number: (data.phone_number || '').replace(/^\+91/, ''),
        }));
      }
    };
    loadUserProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = farmerSchema.safeParse(formData);
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
      // Save farmer name & phone to profiles (linked to logged-in user)
      if (user?.id) {
        const phoneWithCode = `+91${formData.phone_number}`;
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.farmer_name.trim(),
            phone_number: phoneWithCode,
          })
          .eq('user_id', user.id);

        if (profileError) {
          toast({
            title: 'Failed to save personal details',
            description: profileError.message,
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
      }

      const data = {
        location: formData.location,
        village: formData.village || undefined,
        district: formData.district || undefined,
        state: formData.state,
        pincode: formData.pincode || undefined,
        land_size_acres: formData.land_size_acres ? parseFloat(formData.land_size_acres) : undefined,
        crops_grown: formData.crops_grown ? formData.crops_grown.split(',').map(c => c.trim()).filter(Boolean) : undefined
      };

      if (profile) {
        await updateProfile(data);
      } else {
        await createProfile(data);
      }

      toast({
        title: 'Saved successfully',
        description: 'Your farmer details have been saved.',
      });
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
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Farmer Profile</h1>
          <p className="text-muted-foreground">
            {profile ? 'Manage your farmer profile' : 'Complete your farmer registration'}
          </p>
        </div>

        {profile && (
          <div className="mb-6 flex justify-center">
            {profile.is_verified ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified Farmer
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
              Location & Farm Details
            </CardTitle>
            <CardDescription>
              Provide your location details to help traders find you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmer_name">Farmer Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="farmer_name"
                      placeholder="Enter your full name"
                      value={formData.farmer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmer_name: e.target.value }))}
                      className="pl-10"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">+91</span>
                    <Phone className="absolute left-12 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone_number"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="pl-20"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Address *</Label>
                <Input
                  id="location"
                  placeholder="Enter your farm location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    placeholder="Village name"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="District name"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="State name"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="land_size">Land Size (Acres)</Label>
                <Input
                  id="land_size"
                  type="number"
                  step="0.5"
                  placeholder="Enter land size in acres"
                  value={formData.land_size_acres}
                  onChange={(e) => setFormData(prev => ({ ...prev, land_size_acres: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crops_grown">Crops You Grow</Label>
                <Textarea
                  id="crops_grown"
                  placeholder="e.g., Cotton, Paddy, Groundnut, Maize (comma-separated)"
                  value={formData.crops_grown}
                  onChange={(e) => setFormData(prev => ({ ...prev, crops_grown: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Enter crop names separated by commas
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
            After submission, an admin will verify your details. You'll be able to 
            view trader rates and connect with them once verified.
          </p>
        )}
      </div>
    </div>
  );
};

export default FarmerRegistration;
