import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Mail, Lock, User, Phone, MapPin, ArrowLeft, Send, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Validation schemas
const emailSignInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const identifierSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required")
});

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  phoneNumber: z.string().trim().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
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
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'magiclink' | 'forgot'>('email');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const { signUp, signInWithEmail, signInWithMagicLink, resetPassword, resendConfirmation, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role passed from "Join as <role>" buttons. Admin is never accepted via URL.
  const ALLOWED_URL_ROLES = ['farmer', 'seller', 'buyer', 'seasonal_trader', 'everyday_trader'];
  const requestedRole = (() => {
    const r = searchParams.get('role');
    return r && ALLOWED_URL_ROLES.includes(r) ? r : '';
  })();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(requestedRole ? 'signup' : 'signin');

  // Prefill the signup role selector when arriving from a "Join as" button.
  useEffect(() => {
    if (requestedRole && !userRole) {
      setUserRole(requestedRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedRole]);

  const dashboardForRole = (role: string | null | undefined) => {
    switch (role) {
      case 'farmer': return '/farmer-registration';
      case 'seasonal_trader':
      case 'everyday_trader': return '/trader-registration';
      case 'seller': return '/sellers-portal';
      case 'buyer': return '/animals';
      default: return '/home';
    }
  };

  // After login, ensure the requested role is assigned (skip admin), then redirect.
  useEffect(() => {
    if (!user || roleLoading) return;

    const finishRedirect = () => {
      const redirect = searchParams.get('redirect');
      if (isAdmin) {
        navigate('/admin');
      } else if (redirect) {
        navigate(redirect);
      } else if (requestedRole) {
        navigate(dashboardForRole(requestedRole));
      } else {
        navigate('/home');
      }
    };

    if (requestedRole) {
      // Assign role if not already present, then redirect.
      (async () => {
        const { data: existing } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', requestedRole as any)
          .maybeSingle();
        if (!existing) {
          await supabase.from('user_roles').insert({
            user_id: user.id,
            role: requestedRole as any,
          });
        }
        finishRedirect();
      })();
    } else {
      finishRedirect();
    }
  }, [user, isAdmin, roleLoading, navigate, searchParams, requestedRole]);

  // Show feedback when arriving from email verification redirect
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast({
        title: 'Email verified!',
        description: 'Your email is confirmed. Please sign in to continue.',
      });
    } else if (searchParams.get('error') === 'verification_failed') {
      toast({
        title: 'Verification link expired',
        description: 'Please sign in and request a new confirmation email if needed.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSignInSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUnconfirmedEmail(null);
    const { error } = await signInWithEmail(loginEmail, loginPassword);
    
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isNotConfirmed =
        msg.includes('email not confirmed') ||
        msg.includes('not confirmed') ||
        (error as any).code === 'email_not_confirmed';

      if (isNotConfirmed) {
        setUnconfirmedEmail(loginEmail);
        toast({
          title: 'Email not verified',
          description: 'Please check your inbox for the verification email, or click "Resend" below.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
    }
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail || resendCooldown > 0) return;
    setLoading(true);
    const { error } = await resendConfirmation(unconfirmedEmail);
    if (error) {
      toast({
        title: 'Failed to resend',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      startResendCooldown();
      toast({
        title: 'Confirmation email sent',
        description: `We sent a new verification link to ${unconfirmedEmail}.`,
      });
    }
    setLoading(false);
  };

  // Start cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = identifierSchema.safeParse({ identifier: loginIdentifier });
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Only email-based magic link is supported now
    let emailToUse = loginIdentifier;
    
    if (!loginIdentifier.includes('@')) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive a magic link.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await signInWithMagicLink(emailToUse);
    
    if (error) {
      toast({
        title: "Failed to Send Link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMagicLinkSent(true);
      startResendCooldown();
      toast({
        title: "Magic Link Sent!",
        description: "Please check your email for the login link.",
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = z.object({
      email: z.string().trim().email("Invalid email address")
    }).safeParse({ email: forgotEmail });
    
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(forgotEmail);
    
    if (error) {
      toast({
        title: "Failed to Send Reset Link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setForgotPasswordSent(true);
      startResendCooldown();
      toast({
        title: "Reset Link Sent!",
        description: "Please check your email for the password reset link.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const phoneWithCode = `+91${phoneNumber}`;
    const { error: signUpError } = await signUp(email, password, {
      full_name: fullName,
      username: username,
      phone_number: phoneWithCode,
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
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              username: username,
              phone_number: phoneWithCode,
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
          description: "Please check your email and click the verification link before signing in.",
        });
      } catch (error) {
        console.error('Error in signup process:', error);
        toast({
          title: "Account Created!",
          description: "Please check your email and click the verification link before signing in.",
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Choose your preferred sign-in method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    type="button"
                    variant={loginMethod === 'email' ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => {
                      setLoginMethod('email');
                      setMagicLinkSent(false);
                      setForgotPasswordSent(false);
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'magiclink' ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => {
                      setLoginMethod('magiclink');
                      setMagicLinkSent(false);
                      setForgotPasswordSent(false);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Email Link
                  </Button>
                </div>

                {/* Email/Password Login */}
                {loginMethod === 'email' && (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    {unconfirmedEmail && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                          <p>
                            Your email <strong>{unconfirmedEmail}</strong> is not verified yet.
                            Check your inbox for the verification link.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={loading || resendCooldown > 0}
                          >
                            <Send className="h-3 w-3 mr-2" />
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : 'Resend confirmation email'}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (unconfirmedEmail && e.target.value !== unconfirmedEmail) {
                              setUnconfirmedEmail(null);
                            }
                          }}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary" 
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-muted-foreground"
                      onClick={() => {
                        setLoginMethod('forgot');
                        setForgotPasswordSent(false);
                        setForgotEmail(loginEmail);
                      }}
                    >
                      <KeyRound className="h-4 w-4 mr-1" />
                      Forgot Password?
                    </Button>
                  </form>
                )}

                {/* Forgot Password */}
                {loginMethod === 'forgot' && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {!forgotPasswordSent ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="Enter your email address"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            We'll send you a link to reset your password
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-primary" 
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setLoginMethod('email')}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Sign In
                        </Button>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Check your email!</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            We've sent a password reset link to <strong>{forgotEmail}</strong>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setLoginMethod('email');
                              setForgotPasswordSent(false);
                            }}
                          >
                            Back to Sign In
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost"
                            className="flex-1"
                            disabled={loading || resendCooldown > 0}
                            onClick={async () => {
                              setForgotPasswordSent(false);
                              // Re-submit will happen via the form
                            }}
                          >
                            {loading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Link'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* Magic Link Login */}
                {loginMethod === 'magiclink' && (
                  <form onSubmit={handleSendMagicLink} className="space-y-4">
                    {!magicLinkSent ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="login-identifier">Email or Username</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-identifier"
                              type="text"
                              placeholder="Enter your email or username"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            We'll send a login link to your registered email
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-primary" 
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Send Login Link'}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Check your email!</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            We've sent a login link to your email address. Click the link to sign in.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setMagicLinkSent(false);
                              setLoginIdentifier('');
                            }}
                          >
                            Try Different Email
                          </Button>
                          <Button 
                            type="submit" 
                            variant="ghost"
                            className="flex-1"
                            disabled={loading || resendCooldown > 0}
                          >
                            {loading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Link'}
                          </Button>
                        </div>
                      </div>
                    )}
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
                      <span className="absolute left-3 top-3 text-sm text-muted-foreground">+91</span>
                      <Phone className="absolute left-12 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-20"
                        required
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This number can be used for OTP login
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

                  <p className="text-xs text-center text-muted-foreground">
                    No email verification required. Sign in immediately after signup.
                  </p>
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
