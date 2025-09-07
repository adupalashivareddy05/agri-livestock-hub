import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        throw rolesError;
      }

      setRoles(rolesData?.map(r => r.role) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles');
      console.error('Error fetching user roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user?.id]);

  const hasRole = (role: string) => roles.includes(role);
  const isSeller = hasRole('seller');
  const isBuyer = hasRole('buyer');
  const isFarmer = hasRole('farmer');
  const isTrader = hasRole('seasonal_trader') || hasRole('everyday_trader');

  return {
    roles,
    loading,
    error,
    hasRole,
    isSeller,
    isBuyer,
    isFarmer,
    isTrader,
    refetch: fetchUserRoles
  };
};