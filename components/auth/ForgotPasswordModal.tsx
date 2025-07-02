"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../../hooks/use-toast';
import { authService } from '@/services/auth/authService';
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
import { Loader2, ArrowLeft } from 'lucide-react';

// Step 1: Email form schema
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Step 2: OTP verification schema
const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 digits' }).max(6),
});

// Step 3: New password schema
const newPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onOpenChange,
  onLoginClick,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (open) {
      setIsMounted(true);
      // Reset state when opening the modal
      if (step === 1) {
        setEmail('');
        setOtpValues(Array(6).fill(''));
      }
    } else {
      // Add a small delay before unmounting to allow for animations
      const timer = setTimeout(() => {
        setIsMounted(false);
        setStep(1);
        setOtpValues(Array(6).fill(''));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, step]);

  // OTP input handlers
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    
    // Update the OTP values
    const newOtpValues = [...otpValues];
    newOtpValues[index] = numericValue.slice(-1); // Only take the last character
    setOtpValues(newOtpValues);
    
    // Move to next input
    if (numericValue && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const newOtpValues = [...otpValues];
    
    for (let i = 0; i < Math.min(paste.length, 6); i++) {
      newOtpValues[i] = paste[i];
    }
    
    setOtpValues(newOtpValues);
    
    // Focus the next empty input or the last one if all are filled
    const nextIndex = Math.min(paste.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      if (response.data) {
        setCountdown(60); // 60 seconds cooldown
        toast({
          title: 'OTP Resent',
          description: 'A new OTP has been sent to your email.',
        });
      } else if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resend OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize forms
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const newPasswordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  
  const otp = otpValues.join(''); // Combine OTP digits for submission

  // Handle email submission (Step 1)
  const onSubmitEmail = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(values);
      if (response.data) {
        setEmail(values.email);
        setStep(2);
        toast({
          title: 'OTP Sent',
          description: response.data.message,
        });
      } else if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification (Step 2)
  const onSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP length
    if (otpValues.some(v => !v)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter all 6 digits of the OTP',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.verifyPasswordResetOtp({
        email,
        otp: otpValues.join(''),
      });
      
      if (response.data) {
        // No need to store the OTP separately as we already have it in otpValues
        setStep(3);
        toast({
          title: 'OTP Verified',
          description: response.data.message,
        });
      } else if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to verify OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new password submission (Step 3)
  const onSubmitNewPassword = async (values: NewPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword: values.newPassword,
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: 'Your password has been reset successfully!',
        });
        onOpenChange(false);
        if (onLoginClick) onLoginClick();
      } else if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open && !isMounted) return null;

  return (
    <Dialog 
      open={open || isMounted} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'Create New Password'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
            {step === 1
              ? 'Enter your email address to receive a verification code.'
              : step === 2
              ? (
                <>
                  We've sent a 6-digit code to
                  <div className="mt-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md inline-block">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{email}</span>
                  </div>
                </>
              )
              : 'Create a new password for your account.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Email Form */}
        {step === 1 && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Send OTP'}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={onSubmitOtp} className="space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block text-center">
              Enter verification code
            </label>
            
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-12 h-12">
                  <input
                    ref={(el) => {
                      if (el) {
                        otpInputsRef.current[index] = el;
                      }
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="w-full h-full text-center text-xl font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={otpValues[index] || ''}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handlePaste}
                    autoFocus={index === 0}
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-10 font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading || otpValues.some(v => !v) || otpValues.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </Button>
              
              <div className="text-center text-sm">
                <button
                  type="button"
                  className={`font-medium ${
                    countdown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-orange-600 hover:text-orange-500 dark:text-orange-400'
                  }`}
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                >
                  {countdown > 0 
                    ? `Resend OTP in ${countdown}s` 
                    : "Didn't receive code? Resend"}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 flex items-center justify-center w-full"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Email
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <Form {...newPasswordForm}>
            <form onSubmit={newPasswordForm.handleSubmit(onSubmitNewPassword)} className="space-y-4">
              <FormField
                control={newPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={newPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Confirm new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : 'Reset Password'}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {onLoginClick && (
          <div className="text-center text-sm">
            Remember your password?{' '}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => {
                onOpenChange(false);
                onLoginClick();
              }}
            >
              Log in
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
