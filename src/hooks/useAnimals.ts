import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
  description?: string;
  milk_capacity_liters?: number;
  lactation_status?: string;
  vaccination_details?: string;
  body_height_cm?: number;
  father_breed?: string;
  mother_breed?: string;
  adaptability_notes?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  seller_profile?: {
    full_name?: string;
    city?: string;
    state?: string;
  };
  images?: {
    image_url: string;
    image_type: string;
    description?: string;
  }[];
}

export const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select(`
          *,
          images:animal_images(
            image_url,
            image_type,
            description
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Fetch seller profiles separately to avoid relationship issues
      const sellerIds = animalsData?.map(animal => animal.seller_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (sellerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, city, state')
          .in('user_id', sellerIds);
        
        profiles = profilesData || [];
      }

      // Combine animals with their seller profiles
      const animalsWithProfiles = animalsData?.map(animal => ({
        ...animal,
        seller_profile: profiles.find(profile => profile.user_id === animal.seller_id)
      })) || [];

      if (animalsError) {
        throw animalsError;
      }

      setAnimals(animalsWithProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animals');
      console.error('Error fetching animals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return {
    animals,
    loading,
    error,
    refetch: fetchAnimals
  };
};