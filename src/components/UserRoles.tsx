import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, ShoppingCart, Tractor, Store, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Map UI role labels to database enum values. Admin is intentionally excluded —
// it cannot be self-assigned and must be granted manually in the database.
const ROLE_MAPPING: Record<string, Database['public']['Enums']['app_role']> = {
  'Seller': 'seller',
  'Buyer': 'buyer',
  'Farmer': 'farmer',
  'Seasonal Trader': 'seasonal_trader',
  'Daily Trader': 'everyday_trader',
};

const UserRoles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleJoinRole = async (role: string) => {
    // Admin cannot be joined via UI — redirect to auth with no role.
    if (role === 'Admin') {
      toast({
        title: 'Admin access',
        description: 'Admin role is granted manually. Please sign in to your admin account.',
      });
      navigate('/auth');
      return;
    }

    const dbRole = ROLE_MAPPING[role];
    if (!dbRole) return;

    // Not signed in → send to auth, pass role so signup/login can assign it after.
    if (!user) {
      toast({
        title: 'Please sign in',
        description: `Sign in or create an account to join as ${role}.`,
      });
      navigate(`/auth?role=${dbRole}`);
      return;
    }

    setLoading(true);
    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', dbRole)
        .maybeSingle();

      if (!existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.id, role: dbRole }]);

        if (error) {
          toast({
            title: 'Role Assignment Failed',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      toast({
        title: 'Success!',
        description: `You've joined as ${role}. Redirecting...`,
      });

      setTimeout(() => navigate(getDashboardForRole(dbRole)), 800);
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Failed to assign role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDashboardForRole = (role: Database['public']['Enums']['app_role']) => {
    switch (role) {
      case 'farmer': return '/farmer-registration';
      case 'seasonal_trader':
      case 'everyday_trader': return '/trader-registration';
      case 'seller': return '/sellers-portal';
      case 'buyer': return '/animals';
      default: return '/home';
    }
  };
  const animalRoles = [
    {
      title: "Seller",
      icon: User,
      description: "List your livestock with detailed information to reach potential buyers",
      features: ["Upload animal details", "Set pricing", "Manage listings", "Direct buyer contact"],
      color: "bg-gradient-primary"
    },
    {
      title: "Buyer", 
      icon: ShoppingCart,
      description: "Browse and purchase quality livestock from verified sellers",
      features: ["Search animals", "Compare prices", "Contact sellers", "Safe transactions"],
      color: "bg-gradient-fresh"
    },
    {
      title: "Admin",
      icon: Shield,
      description: "Oversee platform operations and ensure quality standards",
      features: ["Verify listings", "Manage users", "Monitor transactions", "Platform analytics"],
      color: "bg-gradient-harvest"
    }
  ];

  const cropRoles = [
    {
      title: "Farmer",
      icon: Tractor,
      description: "Sell your crops at competitive rates to verified traders",
      features: ["List crop produce", "View market rates", "Connect with traders", "Track sales"],
      color: "bg-gradient-primary"
    },
    {
      title: "Seasonal Trader",
      icon: Store,
      description: "Specialize in seasonal crops like cotton, wheat, and maize",
      features: ["Set seasonal rates", "Bulk procurement", "Regional coverage", "Farmer network"],
      color: "bg-gradient-harvest"
    },
    {
      title: "Daily Trader",
      icon: Users,
      description: "Trade in vegetables and daily produce with dynamic pricing",
      features: ["Daily rate updates", "Fresh produce", "Quick transactions", "Local markets"],
      color: "bg-gradient-fresh"
    }
  ];

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Animal Trading Roles */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Animal Trading Roles
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your role in the livestock marketplace ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {animalRoles.map((role, index) => (
              <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{role.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-left">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-primary"
                    onClick={() => handleJoinRole(role.title)}
                    disabled={loading}
                  >
                    {loading ? "Assigning..." : `Join as ${role.title}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Crop Trading Roles */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Crop Trading Roles
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Participate in the agricultural supply chain as a farmer or trader
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cropRoles.map((role, index) => (
              <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{role.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-left">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-muted-foreground">
                        <div className="w-2 h-2 bg-harvest-gold rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-harvest text-harvest-gold-foreground"
                    onClick={() => handleJoinRole(role.title)}
                    disabled={loading}
                  >
                    {loading ? "Assigning..." : `Join as ${role.title}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoles;