import { Button } from "@/components/ui/button";
import { Leaf, Users, Wheat, LogOut, Store, Shield, Sprout, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isFarmer, isTrader } = useUserRole();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });
    }
  };

  const handleProtectedNav = (path: string, label: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: `Please sign in to access ${label}.`,
      });
      navigate(`/auth?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AgroTrade</h1>
            <p className="text-xs text-muted-foreground">Agricultural Marketplace</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/animals')}
          >
            <Users className="h-4 w-4 mr-2" />
            Animals
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/crops')}
          >
            <Wheat className="h-4 w-4 mr-2" />
            Crops
          </Button>
          {(!user || isFarmer) && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleProtectedNav('/farmer-registration', 'My Farm')}
            >
              <Sprout className="h-4 w-4 mr-2" />
              My Farm
            </Button>
          )}
          {(!user || isTrader) && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleProtectedNav('/trader-registration', 'My Business')}
            >
              <Store className="h-4 w-4 mr-2" />
              My Business
            </Button>
          )}
          {user && isTrader && (
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/trader-rates')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              My Rates
            </Button>
          )}
          {user && isAdmin && (
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/admin')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome back!
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Login
              </Button>
              <Button size="sm" className="bg-gradient-primary" onClick={() => navigate('/auth')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;