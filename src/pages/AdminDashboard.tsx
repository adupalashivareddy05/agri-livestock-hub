import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminData } from '@/hooks/useAdminData';
import { 
  ArrowLeft, Shield, Users, Store, Leaf, TrendingUp, 
  CheckCircle, XCircle, Clock, Eye, Loader2, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const { 
    verificationRequests, 
    cropRates, 
    farmers, 
    traders, 
    loading, 
    approveRequest, 
    rejectRequest,
    toggleCropRateStatus,
    refetch
  } = useAdminData();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState<any>(null);

  const isAdmin = hasRole('admin');

  React.useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/auth');
    }
    if (!roleLoading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const handleReject = async () => {
    if (selectedRequest && rejectionReason) {
      await rejectRequest(selectedRequest.id, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const pendingRequests = verificationRequests.filter(r => r.status === 'pending');
  const verifiedFarmers = farmers.filter(f => f.is_verified);
  const verifiedTraders = traders.filter(t => t.is_verified);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, verify accounts, and monitor rates</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedFarmers.length}</p>
                  <p className="text-sm text-muted-foreground">Verified Farmers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedTraders.length}</p>
                  <p className="text-sm text-muted-foreground">Verified Traders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cropRates.filter(r => r.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Crop Rates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Verification Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="farmers" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Farmers ({farmers.length})
            </TabsTrigger>
            <TabsTrigger value="traders" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Traders ({traders.length})
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Crop Rates ({cropRates.length})
            </TabsTrigger>
          </TabsList>

          {/* Verification Requests Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Requests</CardTitle>
                <CardDescription>Review and verify farmer and trader accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {verificationRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No verification requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.profile?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {request.request_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.farmer_data?.location || request.trader_data?.location || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' : 'outline'
                              }
                              className={
                                request.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                request.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : ''
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setViewDetails(request);
                                  setViewDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => approveRequest(request.id, request.request_type, request.entity_id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farmers Tab */}
          <TabsContent value="farmers">
            <Card>
              <CardHeader>
                <CardTitle>Registered Farmers</CardTitle>
                <CardDescription>All farmers registered on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {farmers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No farmers registered</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Village</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Land Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="font-medium">{farmer.location}</TableCell>
                          <TableCell>{farmer.village || '-'}</TableCell>
                          <TableCell>{farmer.district || '-'}</TableCell>
                          <TableCell>{farmer.state}</TableCell>
                          <TableCell>{farmer.land_size_acres ? `${farmer.land_size_acres} acres` : '-'}</TableCell>
                          <TableCell>
                            {farmer.is_verified ? (
                              <Badge className="bg-green-500/10 text-green-600">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(farmer.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traders Tab */}
          <TabsContent value="traders">
            <Card>
              <CardHeader>
                <CardTitle>Registered Traders</CardTitle>
                <CardDescription>All traders registered on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {traders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No traders registered</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {traders.map((trader) => (
                        <TableRow key={trader.id}>
                          <TableCell className="font-medium">{trader.business_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{trader.trader_type}</Badge>
                          </TableCell>
                          <TableCell>{trader.location}</TableCell>
                          <TableCell>{trader.license_number || '-'}</TableCell>
                          <TableCell>
                            {trader.is_verified ? (
                              <Badge className="bg-green-500/10 text-green-600">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(trader.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crop Rates Tab */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Crop Rate Listings</CardTitle>
                <CardDescription>Monitor and manage crop buying rates</CardDescription>
              </CardHeader>
              <CardContent>
                {cropRates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No crop rates listed</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop Type</TableHead>
                        <TableHead>Rate/kg</TableHead>
                        <TableHead>Trader</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Trader Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cropRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium capitalize">{rate.crop_type}</TableCell>
                          <TableCell>₹{rate.rate_per_kg}</TableCell>
                          <TableCell>{rate.trader?.business_name || '-'}</TableCell>
                          <TableCell>{rate.trader?.location || '-'}</TableCell>
                          <TableCell>
                            {rate.trader?.is_verified ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-600" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                              {rate.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(rate.rate_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleCropRateStatus(rate.id, rate.is_active)}
                            >
                              {rate.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewDetails.profile?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewDetails.profile?.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{viewDetails.profile?.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{viewDetails.profile?.state || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">
                  {viewDetails.request_type === 'farmer' ? 'Farmer Details' : 'Trader Details'}
                </h4>
                {viewDetails.request_type === 'farmer' && viewDetails.farmer_data && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p>{viewDetails.farmer_data.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Village</p>
                      <p>{viewDetails.farmer_data.village || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">District</p>
                      <p>{viewDetails.farmer_data.district || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Land Size</p>
                      <p>{viewDetails.farmer_data.land_size_acres ? `${viewDetails.farmer_data.land_size_acres} acres` : '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Crops Grown</p>
                      <p>{viewDetails.farmer_data.crops_grown?.join(', ') || '-'}</p>
                    </div>
                  </div>
                )}
                {viewDetails.request_type === 'trader' && viewDetails.trader_data && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Business Name</p>
                      <p>{viewDetails.trader_data.business_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trader Type</p>
                      <p className="capitalize">{viewDetails.trader_data.trader_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p>{viewDetails.trader_data.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">License Number</p>
                      <p>{viewDetails.trader_data.license_number || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p>{viewDetails.trader_data.specialization?.join(', ') || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

              {viewDetails.status === 'rejected' && viewDetails.rejection_reason && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="text-red-600">{viewDetails.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
