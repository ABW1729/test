"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import {signIn} from 'next-auth/react'
export default function Page() {
  const router = useRouter();
  // const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const callbackUrl = "https://axis-3.vercel.app/profile";
const searchParams = useSearchParams()
const token= searchParams.get('token') 
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token) {
          const response = await fetch('/api/verify-token', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'token':token
            },
          
          });
          if (response.status === 200) {
            const data=response.json();
            setVerified(true);
            await signIn("credentials", {
              email: data.email,
              password: data.password,
              callbackUrl,
            });
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

 

  return (
    <>
    
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div className="text-center">
          <p className="text-lg font-semibold">Verifying...</p>

        </div>
      ) : (
        <div className="text-center">
          {verified ? (
            <p className="text-lg font-semibold text-green-600">Account Verified.Redirecting</p>
          ) : (
            <p className="text-lg font-semibold text-red-600">Invalid token!</p>
          )}
        </div>
      )}
    </div>
    </>
  );
}
