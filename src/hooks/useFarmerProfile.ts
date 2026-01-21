import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FarmerProfile {
  id: string;
  user_id: string;
  location: string;
  village: string | null;
  district: string | null;
  state: string;
  pincode: string | null;
  land_size_acres: number | null;
  crops_grown: string[] | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FarmerInsert {
  location: string;
  village?: string;
  district?: string;
  state: string;
  pincode?: string;
  land_size_acres?: number;
  crops_grown?: string[];
}

export const useFarmerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch farmer profile');
      console.error('Error fetching farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: FarmerInsert) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('farmers')
        .insert({
          user_id: user.id,
          ...profileData
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create verification request
      await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          request_type: 'farmer',
          entity_id: data.id
        });

      setProfile(data);
      toast({
        title: "Profile Created",
        description: "Your farmer profile has been submitted for verification.",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create farmer profile';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<FarmerInsert>) => {
    if (!user?.id || !profile?.id) {
      throw new Error('Profile not found');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('farmers')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your farmer profile has been updated.",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update farmer profile';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile
  };
};
