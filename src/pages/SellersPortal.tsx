import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSellerAnimals } from "@/hooks/useSellerAnimals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Heart, 
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  MessageSquare,
  Package,
  ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useUserRole } from "@/hooks/useUserRole";
import AnimalImageGallery from "@/components/AnimalImageGallery";

const SellersPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("animals");
  const { isSeller, loading: roleLoading } = useUserRole();
  
  const { animals: sellerAnimals, loading: sellerAnimalsLoading, deleteAnimal } = useSellerAnimals();

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Only registered sellers can access this portal.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const handleAddAnimal = () => {
    navigate('/add-animal');
  };

  const handleEditAnimal = (id: string) => {
    toast({
      title: "Edit Animal",
      description: `Edit functionality coming soon for animal #${id}`,
    });
  };

  const handleDeleteAnimal = async (id: string) => {
    try {
      await deleteAnimal(id);
      toast({
        title: "Animal Deleted",
        description: "Your animal listing has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete animal",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const totalListings = sellerAnimals.length;
  const activeListings = sellerAnimals.filter(a => a.is_available).length;
  const totalViews = totalListings * 15; // Mock data
  const totalInquiries = totalListings * 3; // Mock data
  const estimatedRevenue = sellerAnimals.reduce((sum, animal) => sum + Number(animal.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={handleAddAnimal}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Animal
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sellers Portal</h1>
          <p className="text-muted-foreground">Manage your animal listings and track sales performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalListings}</div>
              <p className="text-xs text-muted-foreground">{activeListings} active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalViews}</div>
              <p className="text-xs text-success">+12% this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalInquiries}</div>
              <p className="text-xs text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24%</div>
              <p className="text-xs text-success">+5% vs last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Est. Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{estimatedRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Animal Listings Module */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary" />
                  Animal Listings
                </CardTitle>
                <CardDescription>Manage your animal inventory and listings</CardDescription>
              </div>
              <Button 
                onClick={handleAddAnimal}
                className="bg-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerAnimalsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your listings...</p>
                </div>
              ) : sellerAnimals.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {sellerAnimals.map((animal) => (
                    <Card key={animal.id} className="shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                {animal.animal_type} - {animal.breed}
                              </h3>
                              <Badge variant={animal.is_available ? 'default' : 'secondary'}>
                                {animal.is_available ? 'Available' : 'Sold'}
                              </Badge>
                            </div>
                            
                            <p className="text-3xl font-bold text-primary mb-3">
                              ₹{animal.price.toLocaleString()}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <p className="font-medium text-foreground">{animal.location}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Gender:</span>
                                <p className="font-medium text-foreground">{animal.gender}</p>
                              </div>
                              {animal.age_years !== null && (
                                <div>
                                  <span className="text-muted-foreground">Age:</span>
                                  <p className="font-medium text-foreground">
                                    {animal.age_years}y {animal.age_months}m
                                  </p>
                                </div>
                              )}
                              {animal.milk_capacity_liters && (
                                <div>
                                  <span className="text-muted-foreground">Milk Capacity:</span>
                                  <p className="font-medium text-foreground">{animal.milk_capacity_liters}L</p>
                                </div>
                              )}
                              {animal.body_height_cm && (
                                <div>
                                  <span className="text-muted-foreground">Height:</span>
                                  <p className="font-medium text-foreground">{animal.body_height_cm}cm</p>
                                </div>
                              )}
                            </div>
                            
                            {animal.description && (
                              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                {animal.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex md:flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 md:flex-none"
                              onClick={() => handleEditAnimal(animal.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 md:flex-none text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAnimal(animal.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Animals Listed Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start growing your business by adding your first animal listing
                  </p>
                  <Button 
                    className="bg-gradient-primary"
                    onClick={handleAddAnimal}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Animal
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellersPortal;
