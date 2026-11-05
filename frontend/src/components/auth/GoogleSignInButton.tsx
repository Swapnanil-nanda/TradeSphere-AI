'use client';

import React, { useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api-client';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  width?: number;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'continue_with',
  width
}: GoogleSignInButtonProps) {
  const buttonDivRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '778627959208-vmrupku7mo6mvgnkeikf1cmnl14ou7ge.apps.googleusercontent.com';

  useEffect(() => {
    let checkInterval: any;

    const initializeGIS = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && buttonDivRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              try {
                if (!response.credential) {
                  throw new Error('No credential returned from Google');
                }

                // Decode standard JWT ID token payload from Google
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const googlePayload = JSON.parse(jsonPayload);

                // Call authoritative Spring Boot endpoint
                const authRes = await apiClient.googleLogin({
                  email: googlePayload.email,
                  fullName: googlePayload.name || googlePayload.email.split('@')[0],
                  idToken: response.credential
                });

                if (authRes) {
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    window.location.href = '/app/paper-trading';
                  }
                }
              } catch (err: any) {
                console.error('Google Sign-In failed:', err);
                if (onError) onError(err.message || 'Authentication failed');
              }
            }
          });

          // Clear previous render
          buttonDivRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(buttonDivRef.current, {
            theme: 'filled_black',
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: width || (buttonDivRef.current.parentElement ? buttonDivRef.current.parentElement.clientWidth : 320)
          });
        } catch (e) {
          console.error('Error rendering Google button:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGIS();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGIS();
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, onSuccess, onError, text, width]);

  return (
    <div className="w-full flex justify-center py-1">
      <div ref={buttonDivRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
}
