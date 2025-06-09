"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../src/services/auth/authService';
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
  FormDescription,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// Password requirements
const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters', validate: (val: string) => val.length >= 8 },
  { id: 'uppercase', text: 'At least one uppercase letter', validate: (val: string) => /[A-Z]/.test(val) },
  { id: 'lowercase', text: 'At least one lowercase letter', validate: (val: string) => /[a-z]/.test(val) },
  { id: 'number', text: 'At least one number', validate: (val: string) => /[0-9]/.test(val) },
  { id: 'special', text: 'At least one special character', validate: (val: string) => /[!@#$%^&*(),.?":{}|<>]/.test(val) },
];

const signupSchema = z.object({
  username: z.string()
    .min(3, {
      message: 'Username must be at least 3 characters',
    })
    .max(20, {
      message: 'Username must be less than 20 characters',
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }),
  email: z.string().email({
    message: 'Please enter a valid email',
  }),
  password: z.string()
    .min(8, {
      message: 'Password must be at least 8 characters',
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLoginClick?: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onLoginClick: externalLoginClick,
}) => {
  const { setIsSignupModalOpen, setIsLoginModalOpen } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { toast } = useToast();
  
  // Handle both controlled and uncontrolled open state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : false; // Default to false for uncontrolled
  
  // Memoize setOpen to prevent it from changing on every render
  const setOpen = useMemo(() => {
    return isControlled ? (setExternalOpen || (() => {})) : setIsSignupModalOpen;
  }, [isControlled, setExternalOpen, setIsSignupModalOpen]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = form.watch('password');

  const checkPasswordRequirements = (value: string) => {
    return passwordRequirements.map(req => ({
      ...req,
      isValid: req.validate(value || '')
    }));
  };

  const passwordChecks = checkPasswordRequirements(password);
  const isPasswordValid = passwordChecks.every(check => check.isValid);

  const onSubmit = async (data: SignupFormValues) => {
    if (!isPasswordValid) return;
    
    setIsLoading(true);
    try {
      const response = await authService.signup({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to sign up');
      }


      toast({
        title: 'Account created successfully!',
        description: 'You can now log in with your credentials.',
      });

      // Close signup and open login modal
      form.reset();
      setOpen(false);
      setIsLoginModalOpen(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = useCallback(() => {
    setOpen(false);
    if (externalLoginClick) {
      externalLoginClick();
    } else {
      setIsLoginModalOpen(true);
    }
  }, [setOpen, externalLoginClick, setIsLoginModalOpen]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  }, [form, setOpen]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create an account</DialogTitle>
          <DialogDescription>
            Join the Catalyst community today
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Choose a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                    </div>
                  </FormControl>
                  {passwordFocused && password && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium mb-2">Password must contain:</p>
                      <ul className="space-y-1">
                        {passwordChecks.map((req) => (
                          <li key={req.id} className="flex items-center text-sm">
                            {req.isValid ? (
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className={req.isValid ? 'text-green-600' : 'text-muted-foreground'}>
                              {req.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !form.formState.isValid || !isPasswordValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={handleLoginClick}
                data-testid="login-button"
              >
                Log in
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};