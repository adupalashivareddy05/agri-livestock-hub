-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'buyer', 'farmer', 'seasonal_trader', 'everyday_trader');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create animal types and breeds enums
CREATE TYPE public.animal_type AS ENUM ('cow', 'buffalo', 'goat', 'sheep', 'bull', 'ox');
CREATE TYPE public.gender_type AS ENUM ('male', 'female');
CREATE TYPE public.lactation_status AS ENUM ('high', 'medium', 'low', 'dry');

-- Create animals table
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_type animal_type NOT NULL,
  breed TEXT NOT NULL,
  gender gender_type NOT NULL,
  age_years INTEGER,
  age_months INTEGER,
  lactation_status lactation_status,
  body_height_cm INTEGER,
  milk_capacity_liters INTEGER,
  vaccination_details TEXT,
  mother_breed TEXT,
  father_breed TEXT,
  adaptability_notes TEXT,
  price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on animals
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Create crop categories enum
CREATE TYPE public.crop_category AS ENUM ('seasonal', 'everyday', 'vegetable', 'grain', 'pulse');
CREATE TYPE public.crop_type AS ENUM ('cotton', 'maize', 'paddy', 'groundnut', 'tomato', 'onion', 'potato', 'wheat', 'rice', 'other');

-- Create crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type crop_type NOT NULL,
  crop_name TEXT NOT NULL,
  category crop_category NOT NULL,
  quantity_kg DECIMAL(12,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  harvest_date DATE,
  location TEXT NOT NULL,
  quality_grade TEXT,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Create trader profiles table
CREATE TABLE public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trader_type TEXT NOT NULL, -- 'seasonal', 'everyday', 'merchant'
  specialization TEXT[], -- array of crop types they deal with
  business_name TEXT,
  license_number TEXT,
  location TEXT NOT NULL,
  operating_hours TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on traders
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;

-- Create crop rates table for traders to post daily rates
CREATE TABLE public.crop_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  crop_type crop_type NOT NULL,
  rate_per_kg DECIMAL(10,2) NOT NULL,
  minimum_quantity_kg DECIMAL(12,2),
  maximum_quantity_kg DECIMAL(12,2),
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trader_id, crop_type, rate_date)
);

-- Enable RLS on crop_rates
ALTER TABLE public.crop_rates ENABLE ROW LEVEL SECURITY;

-- Create animal images table for vaccination and animal photos
CREATE TABLE public.animal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'animal_photo', 'vaccination_certificate', 'health_record'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on animal_images
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_traders_updated_at
  BEFORE UPDATE ON public.traders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crop_rates_updated_at
  BEFORE UPDATE ON public.crop_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for animals
CREATE POLICY "Anyone can view available animals" ON public.animals
  FOR SELECT USING (is_available = true);

CREATE POLICY "Sellers can manage own animals" ON public.animals
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Sellers and buyers can insert animals" ON public.animals
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    (public.has_role(auth.uid(), 'seller') OR public.has_role(auth.uid(), 'buyer'))
  );

-- RLS Policies for crops
CREATE POLICY "Anyone can view available crops" ON public.crops
  FOR SELECT USING (is_available = true);

CREATE POLICY "Farmers can manage own crops" ON public.crops
  FOR ALL USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert crops" ON public.crops
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id AND 
    public.has_role(auth.uid(), 'farmer')
  );

-- RLS Policies for traders
CREATE POLICY "Anyone can view traders" ON public.traders
  FOR SELECT USING (true);

CREATE POLICY "Traders can manage own profile" ON public.traders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Traders can insert own profile" ON public.traders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (public.has_role(auth.uid(), 'seasonal_trader') OR 
     public.has_role(auth.uid(), 'everyday_trader'))
  );

-- RLS Policies for crop_rates
CREATE POLICY "Anyone can view active crop rates" ON public.crop_rates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Traders can manage own rates" ON public.crop_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.traders 
      WHERE traders.id = crop_rates.trader_id 
      AND traders.user_id = auth.uid()
    )
  );

-- RLS Policies for animal_images
CREATE POLICY "Anyone can view animal images" ON public.animal_images
  FOR SELECT USING (true);

CREATE POLICY "Animal owners can manage images" ON public.animal_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.animals 
      WHERE animals.id = animal_images.animal_id 
      AND animals.seller_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_animals_seller_id ON public.animals(seller_id);
CREATE INDEX idx_animals_type_location ON public.animals(animal_type, location);
CREATE INDEX idx_animals_available ON public.animals(is_available);

CREATE INDEX idx_crops_farmer_id ON public.crops(farmer_id);
CREATE INDEX idx_crops_type_location ON public.crops(crop_type, location);
CREATE INDEX idx_crops_available ON public.crops(is_available);

CREATE INDEX idx_crop_rates_trader_date ON public.crop_rates(trader_id, rate_date);
CREATE INDEX idx_crop_rates_crop_type ON public.crop_rates(crop_type);
CREATE INDEX idx_crop_rates_active ON public.crop_rates(is_active);

CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);