'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const PrivateRoute = ({ 
  children, 
  redirectPath = '/' 
}: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Show login modal or redirect to login page
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to access this page.',
        variant: 'default',
      });
      
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/signup') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      router.push('/');
    } else if (isAuthenticated) {
      setShouldRender(true);
    }
  }, [isAuthenticated, isLoading, router, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default PrivateRoute;
