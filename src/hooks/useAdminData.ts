import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequest {
  id: string;
  user_id: string;
  request_type: 'farmer' | 'trader';
  entity_id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    full_name: string | null;
    phone_number: string | null;
    city: string | null;
    state: string | null;
  };
  farmer_data?: any;
  trader_data?: any;
}

interface CropRate {
  id: string;
  trader_id: string;
  crop_type: string;
  rate_per_kg: number;
  is_active: boolean;
  rate_date: string;
  trader?: {
    business_name: string | null;
    location: string;
    is_verified: boolean;
  };
}

export const useAdminData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [cropRates, setCropRates] = useState<CropRate[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationRequests = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch additional data for each request
      const enrichedData = await Promise.all((data || []).map(async (request) => {
        // Get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone_number, city, state')
          .eq('user_id', request.user_id)
          .maybeSingle();

        // Get entity-specific data
        let entityData = null;
        if (request.request_type === 'farmer') {
          const { data: farmerData } = await supabase
            .from('farmers')
            .select('*')
            .eq('id', request.entity_id)
            .maybeSingle();
          entityData = { farmer_data: farmerData };
        } else {
          const { data: traderData } = await supabase
            .from('traders')
            .select('*')
            .eq('id', request.entity_id)
            .maybeSingle();
          entityData = { trader_data: traderData };
        }

        return {
          ...request,
          profile: profileData,
          ...entityData
        };
      }));

      setVerificationRequests(enrichedData);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    }
  };

  const fetchCropRates = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('crop_rates')
        .select(`
          *,
          traders:trader_id (
            business_name,
            location,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCropRates(data?.map(rate => ({
        ...rate,
        trader: rate.traders
      })) || []);
    } catch (err) {
      console.error('Error fetching crop rates:', err);
    }
  };

  const fetchFarmers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setFarmers(data || []);
    } catch (err) {
      console.error('Error fetching farmers:', err);
    }
  };

  const fetchTraders = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('traders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTraders(data || []);
    } catch (err) {
      console.error('Error fetching traders:', err);
    }
  };

  const approveRequest = async (requestId: string, requestType: 'farmer' | 'trader', entityId: string) => {
    if (!user?.id) return;

    try {
      // Update verification request
      await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      // Update entity verification status
      const table = requestType === 'farmer' ? 'farmers' : 'traders';
      await supabase
        .from(table)
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq('id', entityId);

      toast({
        title: "Approved",
        description: `${requestType === 'farmer' ? 'Farmer' : 'Trader'} has been verified.`,
      });

      fetchVerificationRequests();
      if (requestType === 'farmer') fetchFarmers();
      else fetchTraders();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (requestId: string, reason: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      toast({
        title: "Rejected",
        description: "Verification request has been rejected.",
      });

      fetchVerificationRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    }
  };

  const toggleCropRateStatus = async (rateId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('crop_rates')
        .update({ is_active: !currentStatus })
        .eq('id', rateId);

      toast({
        title: currentStatus ? "Rate Deactivated" : "Rate Activated",
        description: `Crop rate has been ${currentStatus ? 'deactivated' : 'activated'}.`,
      });

      fetchCropRates();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update rate status.",
        variant: "destructive",
      });
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchVerificationRequests(),
        fetchCropRates(),
        fetchFarmers(),
        fetchTraders()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.id]);

  return {
    verificationRequests,
    cropRates,
    farmers,
    traders,
    loading,
    error,
    approveRequest,
    rejectRequest,
    toggleCropRateStatus,
    refetch: fetchAllData
  };
};
