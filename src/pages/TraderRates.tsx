import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTraderRates } from "@/hooks/useTraderRates";
import { useUserRole } from "@/hooks/useUserRole";
import { Constants } from "@/integrations/supabase/types";

const TraderRates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rates, loading, addRate, updateRate, deleteRate } = useTraderRates();
  const { isTrader, loading: roleLoading } = useUserRole();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    crop_type: '',
    rate_per_kg: '',
    minimum_quantity_kg: '',
    maximum_quantity_kg: '',
    notes: ''
  });

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isTrader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Only traders can access this page.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      crop_type: '',
      rate_per_kg: '',
      minimum_quantity_kg: '',
      maximum_quantity_kg: '',
      notes: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const rateData = {
        crop_type: formData.crop_type as any,
        rate_per_kg: parseFloat(formData.rate_per_kg),
        minimum_quantity_kg: formData.minimum_quantity_kg ? parseFloat(formData.minimum_quantity_kg) : null,
        maximum_quantity_kg: formData.maximum_quantity_kg ? parseFloat(formData.maximum_quantity_kg) : null,
        notes: formData.notes || null,
        rate_date: new Date().toISOString().split('T')[0],
        is_active: true
      };

      if (editingId) {
        await updateRate(editingId, rateData);
        toast({
          title: "Rate Updated",
          description: "Your crop rate has been successfully updated.",
        });
      } else {
        await addRate(rateData);
        toast({
          title: "Rate Added",
          description: "Your crop rate has been successfully added.",
        });
      }
      
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rate",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rate: any) => {
    setFormData({
      crop_type: rate.crop_type,
      rate_per_kg: rate.rate_per_kg.toString(),
      minimum_quantity_kg: rate.minimum_quantity_kg?.toString() || '',
      maximum_quantity_kg: rate.maximum_quantity_kg?.toString() || '',
      notes: rate.notes || ''
    });
    setEditingId(rate.id);
    setIsAdding(true);
  };

  const handleDelete = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this rate?')) return;
    
    try {
      await deleteRate(rateId);
      toast({
        title: "Rate Deleted",
        description: "Your crop rate has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete rate",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Rate
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Crop Rates</h1>
          <p className="text-muted-foreground">Update your daily buying rates for different crops</p>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Add'} Crop Rate</CardTitle>
              <CardDescription>
                {editingId ? 'Update the' : 'Enter the'} buying rate for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop_type">Crop Type *</Label>
                    <Select
                      value={formData.crop_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, crop_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Constants.public.Enums.crop_type.map(crop => (
                          <SelectItem key={crop} value={crop}>
                            {crop.charAt(0).toUpperCase() + crop.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate_per_kg">Rate per KG (₹) *</Label>
                    <Input
                      id="rate_per_kg"
                      type="number"
                      step="0.01"
                      value={formData.rate_per_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, rate_per_kg: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_qty">Min Quantity (KG)</Label>
                    <Input
                      id="min_qty"
                      type="number"
                      step="0.01"
                      value={formData.minimum_quantity_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimum_quantity_kg: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_qty">Max Quantity (KG)</Label>
                    <Input
                      id="max_qty"
                      type="number"
                      step="0.01"
                      value={formData.maximum_quantity_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, maximum_quantity_kg: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional information about this rate..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update' : 'Add'} Rate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Current Rates */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Current Rates</h2>
          {loading ? (
            <div className="text-center py-8">Loading rates...</div>
          ) : rates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No rates added yet</p>
                <Button onClick={() => setIsAdding(true)} className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Rate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates.map((rate) => (
                <Card key={rate.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg capitalize">{rate.crop_type}</CardTitle>
                      <Badge variant={rate.is_active ? "default" : "secondary"}>
                        {rate.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Updated: {new Date(rate.rate_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center py-2">
                        <p className="text-3xl font-bold text-harvest-gold">₹{rate.rate_per_kg}</p>
                        <p className="text-sm text-muted-foreground">per KG</p>
                      </div>

                      {(rate.minimum_quantity_kg || rate.maximum_quantity_kg) && (
                        <div className="text-sm space-y-1">
                          {rate.minimum_quantity_kg && (
                            <p>Min: {rate.minimum_quantity_kg} KG</p>
                          )}
                          {rate.maximum_quantity_kg && (
                            <p>Max: {rate.maximum_quantity_kg} KG</p>
                          )}
                        </div>
                      )}

                      {rate.notes && (
                        <p className="text-sm text-muted-foreground">{rate.notes}</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(rate)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rate.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraderRates;
