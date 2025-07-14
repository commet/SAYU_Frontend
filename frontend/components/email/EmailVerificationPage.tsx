'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { verifyEmail, sendVerificationEmail } from '@/lib/email-api';
import Link from 'next/link';

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>('loading');
  const [message, setMessage] = useState<string>('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmailToken(token);
  }, [token]);

  const verifyEmailToken = async (token: string) => {
    try {
      setStatus('loading');
      await verifyEmail(token);
      setStatus('success');
      setMessage('Your email has been verified successfully!');
    } catch (error: any) {
      console.error('Email verification failed:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Verification failed';
        if (errorMessage.includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('invalid');
          setMessage('Invalid verification link. Please check your email for the correct link.');
        }
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await sendVerificationEmail();
      setMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setMessage('Failed to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/quiz')}
                className="w-full"
              >
                Take Personality Quiz
              </Button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button 
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full"
              size="lg"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send New Verification Email'
              )}
            </Button>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
                size="lg"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send New Verification Email'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => verifyEmailToken(token!)}
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SAYU
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
            
            {message && status !== 'loading' && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:support@sayu.art" className="text-purple-600 hover:text-purple-700">
              support@sayu.art
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}