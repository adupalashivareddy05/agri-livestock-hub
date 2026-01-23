import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Validation schema
const animalSchema = z.object({
  animal_type: z.enum(['cow', 'buffalo', 'goat', 'sheep', 'bull', 'ox'], { errorMap: () => ({ message: "Please select an animal type" }) }),
  breed: z.string().trim().min(1, "Breed is required").max(100, "Breed must be less than 100 characters"),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: "Please select a gender" }) }),
  price: z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be positive").max(10000000, "Price seems unreasonably high"),
  age_years: z.number({ invalid_type_error: "Age must be a number" }).int().min(0).max(25, "Age seems unreasonably high").optional().nullable(),
  age_months: z.number({ invalid_type_error: "Age must be a number" }).int().min(0).max(11, "Months must be between 0-11").optional().nullable(),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters").optional(),
  milk_capacity_liters: z.number({ invalid_type_error: "Milk capacity must be a number" }).positive("Milk capacity must be positive").max(100, "Milk capacity seems unreasonably high").optional().nullable(),
  body_height_cm: z.number({ invalid_type_error: "Height must be a number" }).positive("Height must be positive").max(500, "Height seems unreasonably high").optional().nullable(),
  vaccination_details: z.string().trim().max(1000, "Vaccination details must be less than 1000 characters").optional(),
  father_breed: z.string().trim().max(100, "Father breed must be less than 100 characters").optional(),
  mother_breed: z.string().trim().max(100, "Mother breed must be less than 100 characters").optional(),
  adaptability_notes: z.string().trim().max(500, "Adaptability notes must be less than 500 characters").optional()
});

const AddAnimal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSeller, loading: roleLoading } = useUserRole();
  useEffect(() => {
    if (!roleLoading && !isSeller) {
      toast({
        title: "Access Denied",
        description: "Only sellers can add animal listings",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [roleLoading, isSeller, navigate, toast]);
  
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [vaccinationImageFiles, setVaccinationImageFiles] = useState<File[]>([]);
  const [vaccinationImagePreviews, setVaccinationImagePreviews] = useState<string[]>([]);
  
  const MIN_ANIMAL_PHOTOS = 5;
  const MAX_ANIMAL_PHOTOS = 10;
  const MAX_VACCINATION_PHOTOS = 10;
  
  const [formData, setFormData] = useState({
    animal_type: '',
    breed: '',
    gender: '',
    age_years: '',
    age_months: '',
    price: '',
    location: '',
    description: '',
    milk_capacity_liters: '',
    lactation_status: '',
    vaccination_details: '',
    body_height_cm: '',
    father_breed: '',
    mother_breed: '',
    adaptability_notes: ''
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const remainingSlots = MAX_ANIMAL_PHOTOS - imageFiles.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);
      
      if (filesToAdd.length === 0) {
        toast({
          title: "Maximum photos reached",
          description: `You can only upload up to ${MAX_ANIMAL_PHOTOS} animal photos`,
          variant: "destructive",
        });
        return;
      }
      
      const newPreviews: string[] = [];
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesToAdd.length) {
            setImageFiles(prev => [...prev, ...filesToAdd]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVaccinationImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const remainingSlots = MAX_VACCINATION_PHOTOS - vaccinationImageFiles.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);
      
      if (filesToAdd.length === 0) {
        toast({
          title: "Maximum photos reached",
          description: `You can only upload up to ${MAX_VACCINATION_PHOTOS} vaccination photos`,
          variant: "destructive",
        });
        return;
      }
      
      const newPreviews: string[] = [];
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesToAdd.length) {
            setVaccinationImageFiles(prev => [...prev, ...filesToAdd]);
            setVaccinationImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const uploadImages = async (animalId: string): Promise<string[]> => {
    if (!imageFiles.length || !user) return [];

    const uploadPromises = imageFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${animalId}-photo-${index + 1}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('animal-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  };

  const uploadVaccinationImages = async (animalId: string): Promise<string[]> => {
    if (!vaccinationImageFiles.length || !user) return [];

    const uploadPromises = vaccinationImageFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${animalId}-vaccination-${index + 1}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading vaccination image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('animal-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add animal listings",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Validate input
    const validationData = {
      animal_type: formData.animal_type,
      breed: formData.breed,
      gender: formData.gender,
      price: formData.price ? parseFloat(formData.price) : 0,
      age_years: formData.age_years ? parseInt(formData.age_years) : null,
      age_months: formData.age_months ? parseInt(formData.age_months) : null,
      location: formData.location,
      description: formData.description,
      milk_capacity_liters: formData.milk_capacity_liters ? parseInt(formData.milk_capacity_liters) : null,
      body_height_cm: formData.body_height_cm ? parseInt(formData.body_height_cm) : null,
      vaccination_details: formData.vaccination_details,
      father_breed: formData.father_breed,
      mother_breed: formData.mother_breed,
      adaptability_notes: formData.adaptability_notes
    };

    const result = animalSchema.safeParse(validationData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Validate minimum animal photos
    if (imageFiles.length < MIN_ANIMAL_PHOTOS) {
      toast({
        title: "More photos required",
        description: `Please upload at least ${MIN_ANIMAL_PHOTOS} photos of your animal`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create animal record
      const { data: animal, error: animalError } = await supabase
        .from('animals')
        .insert({
          seller_id: user.id,
          animal_type: formData.animal_type as any,
          breed: formData.breed,
          gender: formData.gender as any,
          age_years: formData.age_years ? parseInt(formData.age_years) : null,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          price: parseFloat(formData.price),
          location: formData.location,
          description: formData.description,
          milk_capacity_liters: formData.milk_capacity_liters ? parseInt(formData.milk_capacity_liters) : null,
          lactation_status: formData.lactation_status as any || null,
          vaccination_details: formData.vaccination_details,
          body_height_cm: formData.body_height_cm ? parseInt(formData.body_height_cm) : null,
          father_breed: formData.father_breed,
          mother_breed: formData.mother_breed,
          adaptability_notes: formData.adaptability_notes
        })
        .select()
        .single();

      if (animalError) {
        throw animalError;
      }

      // Upload animal images
      if (imageFiles.length > 0 && animal) {
        const imageUrls = await uploadImages(animal.id);
        
        if (imageUrls.length > 0) {
          // Create animal_images records - first image is main, rest are gallery
          const imageInserts = imageUrls.map((url, index) => ({
            animal_id: animal.id,
            image_url: url,
            image_type: index === 0 ? 'main' : 'gallery',
            description: index === 0 ? `${formData.animal_type} - ${formData.breed}` : `Photo ${index + 1}`
          }));

          const { error: imageError } = await supabase
            .from('animal_images')
            .insert(imageInserts);

          if (imageError) {
            console.error('Error saving image records:', imageError);
          }
        }
      }

      // Upload vaccination images if provided
      if (vaccinationImageFiles.length > 0 && animal) {
        const vaccinationImageUrls = await uploadVaccinationImages(animal.id);
        
        if (vaccinationImageUrls.length > 0) {
          // Create vaccination image records for each image
          const imageInserts = vaccinationImageUrls.map(url => ({
            animal_id: animal.id,
            image_url: url,
            image_type: 'vaccination',
            description: 'Vaccination certificate'
          }));

          const { error: vaccinationImageError } = await supabase
            .from('animal_images')
            .insert(imageInserts);

          if (vaccinationImageError) {
            console.error('Error saving vaccination image records:', vaccinationImageError);
          }
        }
      }

      toast({
        title: "Animal listing created",
        description: "Your animal has been successfully listed for sale",
      });

      navigate('/animals');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create animal listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/animals')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Animals
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Animal Listing</h1>
          <p className="text-muted-foreground">Create a listing for your animal to reach potential buyers</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Animal Details</CardTitle>
              <CardDescription>Provide detailed information about your animal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">
                    Animal Photos * <span className="text-muted-foreground font-normal">({imagePreviews.length}/{MAX_ANIMAL_PHOTOS} - minimum {MIN_ANIMAL_PHOTOS} required)</span>
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={preview} 
                                alt={`Animal photo ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                  Main
                                </span>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80"
                                onClick={() => {
                                  const newFiles = imageFiles.filter((_, i) => i !== index);
                                  const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                  setImageFiles(newFiles);
                                  setImagePreviews(newPreviews);
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                        </div>
                        {imagePreviews.length < MAX_ANIMAL_PHOTOS && (
                          <div>
                            <Label htmlFor="image" className="cursor-pointer">
                              <div className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80">
                                <Upload className="h-4 w-4" />
                                <span>Add More Photos ({MAX_ANIMAL_PHOTOS - imagePreviews.length} remaining)</span>
                              </div>
                            </Label>
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                        {imagePreviews.length < MIN_ANIMAL_PHOTOS && (
                          <p className="text-sm text-destructive">
                            Please upload at least {MIN_ANIMAL_PHOTOS - imagePreviews.length} more photo(s)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <Label htmlFor="image" className="cursor-pointer">
                            <div className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80">
                              <Upload className="h-4 w-4" />
                              <span>Upload Animal Photos</span>
                            </div>
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload {MIN_ANIMAL_PHOTOS}-{MAX_ANIMAL_PHOTOS} clear photos of your animal (JPEG, PNG)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="animal_type">Animal Type *</Label>
                    <Select value={formData.animal_type} onValueChange={(value) => handleInputChange('animal_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select animal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cow">Cow</SelectItem>
                        <SelectItem value="buffalo">Buffalo</SelectItem>
                        <SelectItem value="goat">Goat</SelectItem>
                        <SelectItem value="sheep">Sheep</SelectItem>
                        <SelectItem value="bull">Bull</SelectItem>
                        <SelectItem value="ox">Ox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder="e.g., Holstein, Gir, Boer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 85000"
                      required
                    />
                  </div>
                </div>

                {/* Age Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_years">Age (Years)</Label>
                    <Input
                      id="age_years"
                      type="number"
                      value={formData.age_years}
                      onChange={(e) => handleInputChange('age_years', e.target.value)}
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age_months">Age (Months)</Label>
                    <Input
                      id="age_months"
                      type="number"
                      value={formData.age_months}
                      onChange={(e) => handleInputChange('age_months', e.target.value)}
                      placeholder="e.g., 6"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Punjab, India"
                    required
                  />
                </div>

                {/* Milk Production (for female dairy animals only) */}
                {formData.gender === 'female' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="milk_capacity_liters">Milk Capacity (Liters/day)</Label>
                      <Input
                        id="milk_capacity_liters"
                        type="number"
                        value={formData.milk_capacity_liters}
                        onChange={(e) => handleInputChange('milk_capacity_liters', e.target.value)}
                        placeholder="e.g., 25"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lactation_status">Lactation Status</Label>
                      <Select value={formData.lactation_status} onValueChange={(value) => handleInputChange('lactation_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Yield</SelectItem>
                          <SelectItem value="medium">Medium Yield</SelectItem>
                          <SelectItem value="low">Low Yield</SelectItem>
                          <SelectItem value="dry">Dry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your animal's qualities, temperament, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccination_details">Vaccination Details</Label>
                  <Textarea
                    id="vaccination_details"
                    value={formData.vaccination_details}
                    onChange={(e) => handleInputChange('vaccination_details', e.target.value)}
                    placeholder="List vaccinations and medical history"
                    rows={2}
                  />
                </div>

                {/* Vaccination Certificate Upload */}
                <div className="space-y-2">
                  <Label htmlFor="vaccination_image">
                    Vaccination Certificate Photos <span className="text-muted-foreground font-normal">({vaccinationImagePreviews.length}/{MAX_VACCINATION_PHOTOS})</span>
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {vaccinationImagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {vaccinationImagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={preview} 
                                alt={`Vaccination certificate ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80"
                                onClick={() => {
                                  const newFiles = vaccinationImageFiles.filter((_, i) => i !== index);
                                  const newPreviews = vaccinationImagePreviews.filter((_, i) => i !== index);
                                  setVaccinationImageFiles(newFiles);
                                  setVaccinationImagePreviews(newPreviews);
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                        </div>
                        {vaccinationImagePreviews.length < MAX_VACCINATION_PHOTOS && (
                          <div>
                            <Label htmlFor="vaccination_image" className="cursor-pointer">
                              <div className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80">
                                <Upload className="h-4 w-4" />
                                <span>Add More Certificates ({MAX_VACCINATION_PHOTOS - vaccinationImagePreviews.length} remaining)</span>
                              </div>
                            </Label>
                            <Input
                              id="vaccination_image"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleVaccinationImageUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                        <div>
                          <Label htmlFor="vaccination_image" className="cursor-pointer">
                            <div className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80">
                              <Upload className="h-4 w-4" />
                              <span>Upload Vaccination Certificates</span>
                            </div>
                          </Label>
                          <Input
                            id="vaccination_image"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleVaccinationImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload up to {MAX_VACCINATION_PHOTOS} vaccination certificates or medical records
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Breeding Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="father_breed">Father Breed</Label>
                    <Input
                      id="father_breed"
                      value={formData.father_breed}
                      onChange={(e) => handleInputChange('father_breed', e.target.value)}
                      placeholder="e.g., Pure Holstein"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mother_breed">Mother Breed</Label>
                    <Input
                      id="mother_breed"
                      value={formData.mother_breed}
                      onChange={(e) => handleInputChange('mother_breed', e.target.value)}
                      placeholder="e.g., Cross Holstein"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating Listing..." : "Create Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/animals')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddAnimal;