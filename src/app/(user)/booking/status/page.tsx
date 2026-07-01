"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentStatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dbId = searchParams.get('id');
    const transactionId = searchParams.get('tid');
    const urlStatus = searchParams.get('status');

    const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
    const [message, setMessage] = useState('Verifying your payment, please wait...');

    useEffect(() => {
        if (!transactionId || !dbId) {
            setStatus('failed');
            setMessage('Missing payment information. Please contact support.');
            return;
        }

        if (urlStatus === 'SUCCESS') {
            setStatus('success');
            setMessage('Payment confirmed! Redirecting to your ticket...');
            setTimeout(() => {
                router.push(`/booking/confirmation?id=${dbId}&bookingId=${transactionId}`);
            }, 2000);
        } else if (urlStatus === 'FAILED' || urlStatus === 'failed') {
            setStatus('failed');
            setMessage('Payment was unsuccessful. Please try again.');
        } else if (searchParams.get('error')) {
            setStatus('failed');
            setMessage('An error occurred during payment verification.');
        }
    }, [transactionId, dbId, urlStatus, router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
            {status === 'checking' && (
                <>
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <h1 className="text-2xl font-bold">Verifying Payment</h1>
                    <p className="text-muted-foreground">{message}</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
                    <p className="text-muted-foreground">{message}</p>
                </>
            )}
            {status === 'failed' && (
                <>
                    <XCircle className="h-16 w-16 text-destructive" />
                    <h1 className="text-2xl font-bold text-destructive">Payment Failed</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </>
            )}
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p>Loading...</p>
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
