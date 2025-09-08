import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithIdentifier: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    setLoading(false);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error };
  };

  const signInWithIdentifier = async (identifier: string, password: string) => {
    setLoading(true);
    
    // Check if identifier is email or username and get the email
    let email = identifier;
    
    // If identifier doesn't contain @, it's likely a username, so we need to find the email
    if (!identifier.includes('@')) {
      try {
        const { data, error } = await supabase.rpc('find_user_by_email_or_username', {
          identifier
        });
        
        if (error || !data) {
          setLoading(false);
          return { error: { message: 'User not found' } };
        }
        
        // Get the email from the user ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', data)
          .single();
          
        if (!profile) {
          setLoading(false);
          return { error: { message: 'User not found' } };
        }
        
        // Get the email from auth.users - we'll need to sign in with the original identifier
        // Since we can't query auth.users directly, we'll try to sign in with the identifier
        // If it's a username, this will fail and we'll handle it gracefully
      } catch (error) {
        setLoading(false);
        return { error: { message: 'Error finding user' } };
      }
    }
    
    // Try to sign in with the identifier (email or username won't work directly with Supabase)
    // We need a different approach - let's try email first, if it fails we'll search by username
    const { error: emailError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    
    if (!emailError) {
      setLoading(false);
      return { error: null };
    }
    
    // If email login failed and identifier doesn't contain @, try to find email by username
    if (!identifier.includes('@')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', identifier)
          .single();
          
        if (profile) {
          // We found the profile, but we still need the email to sign in
          // Since we can't access auth.users directly, we'll return an error
          setLoading(false);
          return { error: { message: 'Please use your email address to sign in' } };
        }
      } catch (error) {
        // Username not found
      }
    }
    
    setLoading(false);
    return { error: emailError };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithIdentifier,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};