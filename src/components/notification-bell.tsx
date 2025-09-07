
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTodaysAndTomorrowsBookings } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';

export function NotificationBell() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingCount = async () => {
            try {
                const bookings = await getTodaysAndTomorrowsBookings();
                setCount(bookings.length);
            } catch (error) {
                console.error("Failed to fetch booking count:", error);
                setCount(0); // Set count to 0 on error
            } finally {
                setLoading(false);
            }
        };

        fetchBookingCount();
        
        const intervalId = setInterval(fetchBookingCount, 5 * 60 * 1000); // every 5 minutes

        return () => clearInterval(intervalId);

    }, []);

    return (
        <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/notifications" className="relative">
                {loading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        <Bell />
                        {count > 0 && (
                            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                {count}
                            </span>
                        )}
                    </>
                )}
                 <span className="sr-only">View Notifications</span>
            </Link>
        </Button>
    );
}
