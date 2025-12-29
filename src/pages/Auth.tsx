import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Mail, Lock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Validation schemas
const phoneSignInSchema = z.object({
  phone: z.string().trim().regex(/^\+[0-9]{10,15}$/, "Phone number must start with + and country code (e.g., +919876543210)")
});

const otpSchema = z.object({
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits")
});

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  phoneNumber: z.string().trim().regex(/^\+[0-9]{10,15}$/, "Phone must start with + and country code (e.g., +919876543210)"),
  address: z.string().trim().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional().or(z.literal('')),
  state: z.string().trim().max(100, "State must be less than 100 characters").optional().or(z.literal('')),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits").optional().or(z.literal('')),
  userRole: z.string().min(1, "Please select a role")
});

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp, signInWithPhone, verifyOtp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone
    const result = phoneSignInSchema.safeParse({ phone: loginPhone });
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithPhone(loginPhone);
    
    if (error) {
      toast({
        title: "Failed to Send OTP",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(loginPhone, otp);
    
    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = signUpSchema.safeParse({
      email,
      password,
      username,
      fullName,
      phoneNumber,
      address,
      city,
      state,
      pincode,
      userRole
    });
    
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Sign up the user
    const { error: signUpError } = await signUp(email, password, {
      full_name: fullName,
      username: username,
      phone_number: phoneNumber,
      address,
      city,
      state,
      pincode
    });

    if (signUpError) {
      toast({
        title: "Sign Up Failed", 
        description: signUpError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Wait a bit for the trigger to create the profile
    setTimeout(async () => {
      try {
        // Add user role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: userRole as any
            });

          if (roleError) {
            console.error('Error adding role:', roleError);
            toast({
              title: "Role Assignment Failed",
              description: "Account created but role assignment failed. Please contact support.",
              variant: "destructive",
            });
          }

          // Update profile with additional info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              username: username,
              phone_number: phoneNumber,
              address,
              city,
              state,
              pincode
            })
            .eq('user_id', user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        }

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      } catch (error) {
        console.error('Error in signup process:', error);
        toast({
          title: "Partial Success",
          description: "Account created but some details may not be saved. Please update your profile after login.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">AgroTrade</h1>
          <p className="text-muted-foreground">Agricultural Marketplace</p>
        </div>

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sign In with Phone</CardTitle>
                <CardDescription>
                  {otpSent 
                    ? "Enter the OTP sent to your phone." 
                    : "We'll send you a verification code."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-phone"
                          type="tel"
                          placeholder="+919876543210"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +91 for India)
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary" 
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-otp">Enter OTP</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary" 
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify & Sign In'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join our agricultural marketplace community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          placeholder="Enter full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-username"
                          placeholder="Choose username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role *</Label>
                    <Select value={userRole} onValueChange={setUserRole} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="seller">Animal Seller</SelectItem>
                        <SelectItem value="buyer">Animal Buyer</SelectItem>
                        <SelectItem value="seasonal_trader">Seasonal Trader</SelectItem>
                        <SelectItem value="everyday_trader">Everyday Trader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+919876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +91 for India)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-address"
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City</Label>
                      <Input
                        id="signup-city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">State</Label>
                      <Input
                        id="signup-state"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-pincode">Pincode</Label>
                      <Input
                        id="signup-pincode"
                        placeholder="Pin"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;