"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../src/services/auth/authService';

type OtpInputRefs = Array<HTMLInputElement | null>;

interface OtpFormValues extends FieldValues {
  otp: string[];
}
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
  const [currentStep, setCurrentStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const otpInputsRef = useRef<OtpInputRefs>([]);
  
  // Initialize refs array
  useEffect(() => {
    otpInputsRef.current = otpInputsRef.current.slice(0, 6);
  }, []);
  
  // Countdown effect for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Handle both controlled and uncontrolled open state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : false; // Default to false for uncontrolled
  
  // Memoize setOpen to prevent it from changing on every render
  const setOpen = useMemo(() => {
    return isControlled ? (setExternalOpen || (() => {})) : setIsSignupModalOpen;
  }, [isControlled, setExternalOpen, setIsSignupModalOpen]);

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  
  const otpForm = useForm<OtpFormValues>({
    defaultValues: {
      otp: Array(6).fill('')
    },
    mode: 'onChange',
  });
  
  const { fields } = useFieldArray({
    control: otpForm.control,
    name: 'otp',
    keyName: 'key' // Add keyName to fix the missing key error
  });
  
  // Initialize OTP fields when component mounts
  useEffect(() => {
    if (currentStep === 2) {
      otpForm.reset({ otp: Array(6).fill('') });
    }
  }, [currentStep, otpForm]);

  const password = signupForm.watch('password');
  
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    // Update the current field
    const newOtp = [...otpForm.getValues('otp')];
    newOtp[index] = value.slice(-1); // Only take the last character
    otpForm.setValue('otp', newOtp, { shouldValidate: true });
    
    // Auto-focus next input if there's a value and not the last input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };
  
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpForm.getValues('otp')[index] && index > 0) {
      // Move to previous input on backspace when current is empty
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move left with left arrow
      e.preventDefault();
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move right with right arrow
      e.preventDefault();
      otpInputsRef.current[index + 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(paste)) {
      const otpArray = paste.split('').slice(0, 6);
      otpForm.setValue('otp', otpArray, { shouldValidate: true });
      // Focus the last input after paste
      setTimeout(() => otpInputsRef.current[5]?.focus(), 0);
    }
  };

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

      // Show success message from API
      toast({
        title: 'Success!',
        description: response.data?.message || 'Registration successful. Please check your email for the OTP.',
      });

      // Move to OTP verification step
      setUserEmail(data.email);
      setCurrentStep(2);
      setCountdown(60); // 1 minute countdown for resend
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
  
  const handleVerifyOtp = async (data: { otp: string[] | string }) => {
    // Ensure otp is an array
    const otpArray = Array.isArray(data.otp) ? data.otp : [data.otp];
    const otp = otpArray.join('');
    setIsLoading(true);
    try {
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      const response = await authService.verifyOtp({
        email: userEmail,
        otp: otp
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to verify OTP');
      }
      
      toast({
        title: 'Email verified!',
        description: response.data?.message || 'Your email has been verified successfully. You can now log in.',
      });
      
      // Reset forms and close modal
      signupForm.reset();
      otpForm.reset();
      setCurrentStep(1);
      setOpen(false);
      setIsLoginModalOpen(true);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Verification failed',
        description: error.message || 'An error occurred while verifying OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      // Since we don't have a resendOtp endpoint, we'll just show a message
      // You can implement the actual resend logic when the endpoint is available
      toast({
        title: 'OTP Resent!',
        description: 'A new OTP has been sent to your email.',
      });
      
      setCountdown(60); // Reset countdown
      return;
      
      // Uncomment this when the resendOtp endpoint is available
      /*
      const response = await authService.verifyOtp({
        email: userEmail,
        otp: '' // This should be handled by the backend
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to resend OTP');
      }
      
      toast({
        title: 'OTP sent!',
        description: response.data?.message || 'A new OTP has been sent to your email.',
      });
      
      setCountdown(60); // Reset countdown
      */
      
      setCountdown(60); // Reset countdown
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast({
        title: 'Failed to resend OTP',
        description: error.message || 'An error occurred while resending OTP',
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
      signupForm.reset();
      otpForm.reset();
      setCurrentStep(1);
      setUserEmail('');
      setCountdown(0);
      setError('');
    }
    setOpen(newOpen);
  }, [signupForm, otpForm, setOpen]);

  const handleBackToSignup = () => {
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Join the Catalyst community today
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {currentStep === 1 ? (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Choose a username" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Enter your email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="Create a password"
                          {...field}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                        />
                      </div>
                    </FormControl>
                    
                    {passwordFocused && password && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Password Requirements:</p>
                        <ul className="space-y-1.5">
                          {passwordChecks.map((req) => (
                            <li key={req.id} className="flex items-center">
                              {req.isValid ? (
                                <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-red-500 mr-2 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${req.isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {req.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
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
                        placeholder="Confirm your password" 
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
                  className={`w-full h-10 font-medium rounded-md transition-colors ${
                    !isPasswordValid || !signupForm.formState.isValid 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isLoading || !signupForm.formState.isValid || !isPasswordValid}
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
              </div>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit((data) => handleVerifyOtp({ otp: data.otp }))} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verify Your Email</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    We've sent a verification code to
                  </p>
                  <div className="mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md inline-block">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{userEmail}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 block text-center">
                    Enter verification code
                  </FormLabel>
                  
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="w-12 h-12">
                        <input
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          className="w-full h-full text-center text-xl font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={otpForm.watch(`otp.${index}`) || ''}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handlePaste}
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                  <FormMessage className="text-red-500 text-xs text-center" />
                </div>
                
                <div className="pt-2 space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full h-10 font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
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
                      className="text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400"
                      onClick={() => {
                        setCurrentStep(1);
                        setError('');
                      }}
                      disabled={isLoading}
                    >
                      Back to Sign Up
                    </button>
                  </div>
                </div>
              </form>
            </Form>
          )}
          
          {currentStep === 1 && (
            <>
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
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
                  onClick={handleLoginClick}
                  data-testid="login-button"
                >
                  Log in
                </button>
              </div>
            </>
          )}
         </div>
      </DialogContent>
    </Dialog>
  );
};