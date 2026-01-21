-- Add farmers table for farmer-specific data
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  location TEXT NOT NULL,
  village TEXT,
  district TEXT,
  state TEXT NOT NULL,
  pincode TEXT,
  land_size_acres NUMERIC,
  crops_grown TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_verified column to traders table
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Enable RLS on farmers table
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers
CREATE POLICY "Anyone can view verified farmers"
ON public.farmers
FOR SELECT
USING (is_verified = true);

CREATE POLICY "Users can view own farmer profile"
ON public.farmers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own profile"
ON public.farmers
FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND has_role(auth.uid(), 'farmer'::app_role));

CREATE POLICY "Farmers can update own profile"
ON public.farmers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all farmers"
ON public.farmers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for farmers
CREATE TRIGGER update_farmers_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create verification_requests table for admin workflow
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('farmer', 'trader')),
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_requests
CREATE POLICY "Users can view own verification requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verification requests"
ON public.verification_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for verification_requests
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trader_contacts table to track farmer-trader interactions
CREATE TABLE public.trader_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  crop_rate_id UUID REFERENCES public.crop_rates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'contacted' CHECK (status IN ('contacted', 'negotiating', 'agreed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trader_contacts
ALTER TABLE public.trader_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trader_contacts
CREATE POLICY "Farmers can view own contacts"
ON public.trader_contacts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.farmers f WHERE f.id = trader_contacts.farmer_id AND f.user_id = auth.uid()
));

CREATE POLICY "Traders can view contacts with them"
ON public.trader_contacts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.traders t WHERE t.id = trader_contacts.trader_id AND t.user_id = auth.uid()
));

CREATE POLICY "Farmers can insert contacts"
ON public.trader_contacts
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.farmers f WHERE f.id = trader_contacts.farmer_id AND f.user_id = auth.uid()
));

CREATE POLICY "Participants can update contacts"
ON public.trader_contacts
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.farmers f WHERE f.id = trader_contacts.farmer_id AND f.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_contacts.trader_id AND t.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all contacts"
ON public.trader_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for trader_contacts
CREATE TRIGGER update_trader_contacts_updated_at
BEFORE UPDATE ON public.trader_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();