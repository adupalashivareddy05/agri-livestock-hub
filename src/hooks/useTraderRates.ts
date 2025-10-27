import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type CropRate = Database['public']['Tables']['crop_rates']['Row'];
type CropRateInsert = Database['public']['Tables']['crop_rates']['Insert'];
type CropRateUpdate = Database['public']['Tables']['crop_rates']['Update'];

export const useTraderRates = () => {
  const { user } = useAuth();
  const [rates, setRates] = useState<CropRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraderRates = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get the trader profile
      const { data: traderData, error: traderError } = await supabase
        .from('traders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (traderError) {
        if (traderError.code === 'PGRST116') {
          setRates([]);
          setLoading(false);
          return;
        }
        throw traderError;
      }

      // Then fetch their rates
      const { data: ratesData, error: ratesError } = await supabase
        .from('crop_rates')
        .select('*')
        .eq('trader_id', traderData.id)
        .order('rate_date', { ascending: false });

      if (ratesError) throw ratesError;

      setRates(ratesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      console.error('Error fetching trader rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRate = async (rateData: Omit<CropRateInsert, 'trader_id'>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Get trader profile
      const { data: traderData, error: traderError } = await supabase
        .from('traders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (traderError) throw traderError;

      const { data, error } = await supabase
        .from('crop_rates')
        .insert([{ ...rateData, trader_id: traderData.id }])
        .select()
        .single();

      if (error) throw error;

      setRates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add rate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateRate = async (rateId: string, updates: CropRateUpdate) => {
    try {
      const { data, error } = await supabase
        .from('crop_rates')
        .update(updates)
        .eq('id', rateId)
        .select()
        .single();

      if (error) throw error;

      setRates(prev => prev.map(rate => rate.id === rateId ? data : rate));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update rate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteRate = async (rateId: string) => {
    try {
      const { error } = await supabase
        .from('crop_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;

      setRates(prev => prev.filter(rate => rate.id !== rateId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTraderRates();
  }, [user?.id]);

  return {
    rates,
    loading,
    error,
    addRate,
    updateRate,
    deleteRate,
    refetch: fetchTraderRates
  };
};
