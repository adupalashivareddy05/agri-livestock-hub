import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SellerAnimal {
  id: string;
  animal_type: string;
  breed: string;
  gender: string;
  age_years?: number;
  age_months?: number;
  price: number;
  location: string;
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
  images?: {
    image_url: string;
    image_type: string;
    description?: string;
  }[];
}

export const useSellerAnimals = () => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<SellerAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSellerAnimals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

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
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (animalsError) {
        throw animalsError;
      }

      setAnimals(animalsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seller animals');
      console.error('Error fetching seller animals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerAnimals();
  }, [user?.id]);

  const deleteAnimal = async (animalId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId)
        .eq('seller_id', user.id); // Ensure only owner can delete

      if (error) {
        throw error;
      }

      // Update local state to remove the deleted animal
      setAnimals(prev => prev.filter(animal => animal.id !== animalId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete animal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    animals,
    loading,
    error,
    refetch: fetchSellerAnimals,
    deleteAnimal
  };
};