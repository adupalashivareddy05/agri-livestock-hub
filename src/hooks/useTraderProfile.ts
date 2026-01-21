import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TraderProfile {
  id: string;
  user_id: string;
  trader_type: string;
  location: string;
  business_name: string | null;
  license_number: string | null;
  operating_hours: string | null;
  specialization: string[] | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TraderInsert {
  trader_type: string;
  location: string;
  business_name?: string;
  license_number?: string;
  operating_hours?: string;
  specialization?: string[];
}

export const useTraderProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TraderProfile | null>(null);
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
        .from('traders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trader profile');
      console.error('Error fetching trader profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: TraderInsert) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('traders')
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
          request_type: 'trader',
          entity_id: data.id
        });

      setProfile(data);
      toast({
        title: "Profile Created",
        description: "Your trader profile has been submitted for verification.",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trader profile';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<TraderInsert>) => {
    if (!user?.id || !profile?.id) {
      throw new Error('Profile not found');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('traders')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your trader profile has been updated.",
      });
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update trader profile';
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
