"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/features/auth/authSlice';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: 'Username or email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSignupClick?: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onSignupClick: externalSignupClick,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isLoading, error } = useAppSelector((state: any) => state.auth);
  
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Handle both controlled and uncontrolled open state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : isOpen;
  
  // Memoize setOpen to prevent it from changing on every render
  const setOpen = useMemo(() => {
    return isControlled ? (setExternalOpen || (() => {})) : setIsOpen;
  }, [isControlled, setExternalOpen, setIsOpen]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resultAction = await dispatch(loginUser(data));
      
      if (loginUser.fulfilled.match(resultAction)) {
        toast({
          title: 'Success',
          description: 'You have been successfully logged in!',
        });
        setOpen(false);
        form.reset();
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Login submission error:', error);
      // Error is already handled by the error effect below
    }
  };

  // Handle error toast and reset loading state
  useEffect(() => {
    if (error) {
      console.log('Login error occurred:', error);
      
      let errorMessage = 'An error occurred during login';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        // Handle error message from response data
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        // Handle error object from response data
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        // Handle error message from error object
        errorMessage = error.message;
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSignupClick = useCallback(() => {
    setOpen(false);
    if (externalSignupClick) {
      externalSignupClick();
    } else {
      dispatch({ type: 'OPEN_SIGNUP_MODAL' });
    }
  }, [setOpen, externalSignupClick, dispatch]);
  
  // Handle modal state changes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  }, [form, setOpen]);

  type FormFieldProps = {
    field: {
      value: any;
      onChange: (value: any) => void;
      onBlur: () => void;
      name: string;
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg"
        onInteractOutside={(e: any) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Log in to continue to Catalyst
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username or Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your username or email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <button 
                        type="button" 
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loader" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button 
              type="button" 
              className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              onClick={handleSignupClick}
            >
              Sign up
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};