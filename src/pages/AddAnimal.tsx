import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AddAnimal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (animalId: string): Promise<string | null> => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${animalId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('animal-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('animal-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
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

      // Upload image if provided
      if (imageFile && animal) {
        const imageUrl = await uploadImage(animal.id);
        
        if (imageUrl) {
          // Create animal_images record
          const { error: imageError } = await supabase
            .from('animal_images')
            .insert({
              animal_id: animal.id,
              image_url: imageUrl,
              image_type: 'main',
              description: `${formData.animal_type} - ${formData.breed}`
            });

          if (imageError) {
            console.error('Error saving image record:', imageError);
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
                  <Label htmlFor="image">Animal Photo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Animal preview" 
                          className="w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <Label htmlFor="image" className="cursor-pointer">
                            <div className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80">
                              <Upload className="h-4 w-4" />
                              <span>Upload Animal Photo</span>
                            </div>
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload a clear photo of your animal (JPEG, PNG)
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

                {/* Milk Production (for dairy animals) */}
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
                        <SelectItem value="lactating">Lactating</SelectItem>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="pregnant">Pregnant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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