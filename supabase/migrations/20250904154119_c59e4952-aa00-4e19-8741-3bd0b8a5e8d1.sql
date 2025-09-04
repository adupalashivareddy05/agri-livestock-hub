-- Create storage bucket for animal images
INSERT INTO storage.buckets (id, name, public) VALUES ('animal-images', 'animal-images', true);

-- Create storage policies for animal images
CREATE POLICY "Anyone can view animal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-images');

CREATE POLICY "Sellers can upload animal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'animal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (
    has_role(auth.uid(), 'seller'::app_role) 
    OR has_role(auth.uid(), 'buyer'::app_role)
    OR has_role(auth.uid(), 'farmer'::app_role)
  )
);

CREATE POLICY "Sellers can update their animal images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'animal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete their animal images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'animal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);