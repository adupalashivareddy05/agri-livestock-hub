import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useAnimals } from "@/hooks/useAnimals";
import { useSellerAnimals } from "@/hooks/useSellerAnimals";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Heart, 
  Wheat, 
  Users, 
  DollarSign,
  MapPin,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("animals");
  
  const { animals: allAnimals, loading: allAnimalsLoading } = useAnimals();
  const { animals: sellerAnimals, loading: sellerAnimalsLoading } = useSellerAnimals();
  const { isSeller, loading: roleLoading } = useUserRole();

  // Use seller's own animals if they're a seller, otherwise show all animals
  const animals = isSeller ? sellerAnimals : allAnimals;
  const animalsLoading = isSeller ? sellerAnimalsLoading : allAnimalsLoading;

  // Sample crop data - will be replaced with real data later
  const userCrops = [
    {
      id: 1,
      name: "Organic Wheat",
      quantity: "500 kg",
      price: "₹2,200/quintal",
      status: "active",
      views: 18,
      inquiries: 3
    }
  ];

  const handleAddListing = (type: 'animal' | 'crop') => {
    if (type === 'animal') {
      if (!isSeller) {
        toast({
          title: "Access Denied",
          description: "Only sellers can add animal listings",
          variant: "destructive"
        });
        return;
      }
      navigate('/add-animal');
    } else {
      toast({
        title: "Add Listing",
        description: "Crop listing form will be available soon",
      });
    }
  };

  const handleEditListing = (id: string | number, type: 'animal' | 'crop') => {
    toast({
      title: "Edit Listing",
      description: `Edit ${type} listing #${id}`,
    });
  };

  const handleDeleteListing = (id: string | number, type: 'animal' | 'crop') => {
    toast({
      title: "Delete Listing", 
      description: `${type} listing #${id} deleted`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{animals.length + userCrops.length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">42</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹1,65,000</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Listings Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">My Listings</CardTitle>
            <CardDescription>Manage your animal and crop listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="animals" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="animals" className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Animals
                  </TabsTrigger>
                  <TabsTrigger value="crops" className="flex items-center">
                    <Wheat className="h-4 w-4 mr-2" />
                    Crops
                  </TabsTrigger>
                </TabsList>
                {((activeTab === 'animals' && isSeller) || activeTab === 'crops') && (
                  <Button 
                    onClick={() => handleAddListing(activeTab === 'animals' ? 'animal' : 'crop')}
                    className="bg-gradient-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {activeTab === 'animals' ? 'Animal' : 'Crop'}
                  </Button>
                )}
              </div>

              <TabsContent value="animals">
                <div className="space-y-4">
                  {animalsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading your listings...</p>
                    </div>
                  ) : animals.length > 0 ? (
                    animals.map((animal) => (
                      <Card key={animal.id} className="shadow-soft">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {animal.animal_type} - {animal.breed}
                                </h3>
                                <Badge variant={animal.is_available ? 'default' : 'secondary'}>
                                  {animal.is_available ? 'active' : 'inactive'}
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-primary mb-2">₹{animal.price.toLocaleString()}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{animal.location}</span>
                                <span>{animal.gender}</span>
                                {animal.age_years && <span>{animal.age_years}y {animal.age_months}m</span>}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditListing(animal.id, 'animal')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteListing(animal.id, 'animal')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {!isSeller ? "Only sellers can add animal listings" : "No animal listings yet"}
                      </p>
                      {isSeller && (
                        <Button 
                          className="mt-4 bg-gradient-primary"
                          onClick={() => handleAddListing('animal')}
                        >
                          Add Your First Animal
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="crops">
                <div className="space-y-4">
                  {userCrops.length > 0 ? (
                    userCrops.map((crop) => (
                      <Card key={crop.id} className="shadow-soft">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {crop.name} - {crop.quantity}
                                </h3>
                                <Badge variant={crop.status === 'active' ? 'default' : 'secondary'}>
                                  {crop.status}
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-harvest-gold mb-2">{crop.price}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{crop.views} views</span>
                                <span>{crop.inquiries} inquiries</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditListing(crop.id, 'crop')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteListing(crop.id, 'crop')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Wheat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No crop listings yet</p>
                      <Button 
                        className="mt-4 bg-gradient-harvest text-harvest-gold-foreground"
                        onClick={() => handleAddListing('crop')}
                      >
                        Add Your First Crop
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;