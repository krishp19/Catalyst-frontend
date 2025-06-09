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
}

export const LoginModal: React.FC<LoginModalProps> = ({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onSignupClick: externalSignupClick,
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
    const resultAction = await dispatch(loginUser(data));
    
    if (loginUser.fulfilled.match(resultAction)) {
      toast({
        title: 'Success',
        description: 'You have been successfully logged in!',
      });
      setOpen(false);
      form.reset();
    }
  };

  // Handle error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
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
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e: any) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Log in to Catalyst</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username or email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" className="p-0" onClick={handleSignupClick}>
              Sign up
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};