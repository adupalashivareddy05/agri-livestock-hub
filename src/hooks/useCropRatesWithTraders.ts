import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

type CropRateWithTrader = {
  id: string;
  crop_type: string;
  rate_per_kg: number;
  minimum_quantity_kg: number | null;
  maximum_quantity_kg: number | null;
  rate_date: string;
  is_active: boolean;
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
      phone_number: string | null;
    } | null;
  };
};

export const useCropRatesWithTraders = () => {
  const [rates, setRates] = useState<CropRateWithTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCropRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch crop rates with traders
      const { data: ratesData, error: ratesError } = await supabase
        .from('crop_rates')
        .select(`
          *,
          traders!inner (
            id,
            business_name,
            trader_type,
            location,
            operating_hours,
            specialization,
            user_id
          )
        `)
        .eq('is_active', true)
        .order('rate_date', { ascending: false });

      if (ratesError) throw ratesError;

      if (!ratesData || ratesData.length === 0) {
        setRates([]);
        setLoading(false);
        return;
      }

      // Get unique trader user IDs
      const traderUserIds = Array.from(
        new Set(
          ratesData
            .map(rate => (rate.traders as any)?.user_id)
            .filter(Boolean)
        )
      );

      // Fetch profiles for all trader users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone_number')
        .in('user_id', traderUserIds);

      // Transform data
      const transformedRates = ratesData.map(rate => {
        const trader = rate.traders as any;
        const profile = profilesData?.find(p => p.user_id === trader?.user_id);
        
        return {
          id: rate.id,
          crop_type: rate.crop_type,
          rate_per_kg: rate.rate_per_kg,
          minimum_quantity_kg: rate.minimum_quantity_kg,
          maximum_quantity_kg: rate.maximum_quantity_kg,
          rate_date: rate.rate_date,
          is_active: rate.is_active,
          notes: rate.notes,
          trader: {
            id: trader?.id || '',
            business_name: trader?.business_name || null,
            trader_type: trader?.trader_type || 'everyday',
            location: trader?.location || 'Unknown',
            operating_hours: trader?.operating_hours || null,
            specialization: trader?.specialization || null,
            user: profile ? {
              full_name: profile.full_name,
              phone_number: profile.phone_number
            } : null
          }
        };
      });

      setRates(transformedRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crop rates');
      console.error('Error fetching crop rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropRates();
  }, []);

  return {
    rates,
    loading,
    error,
    refetch: fetchCropRates
  };
};

