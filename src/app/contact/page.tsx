
"use client";

import { useEffect, useState } from "react";
import { getContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactCard } from "@/components/contact/contact-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ContactInfo = {
    whatsapp: string;
    call: string;
};

export default function ContactPage() {
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getContactInfo()
            .then(data => {
                if (data) {
                    setContactInfo(data)
                } else {
                    setError("Contact information is not available at the moment.")
                }
            })
            .catch(() => setError("Failed to load contact information. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <ContactCardSkeleton />
                    <ContactCardSkeleton />
                </>
            );
        }

        if (error) {
            return (
                <div className="md:col-span-2">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )
        }

        if (contactInfo) {
            return (
                <>
                    <ContactCard
                        type="WhatsApp"
                        description="For booking & inquiries"
                        contactNumber={contactInfo.whatsapp}
                        link={`https://wa.me/91${contactInfo.whatsapp}`}
                        buttonText="Chat on WhatsApp"
                    />
                     <ContactCard
                        type="Call"
                        description="Speak to our support team"
                        contactNumber={contactInfo.call}
                        link={`tel:+91${contactInfo.call}`}
                        buttonText="Call Now"
                    />
                </>
            )
        }

        return null;
    }

    return (
        <div className="bg-muted/40 py-12 md:py-24">
            <div className="container mx-auto max-w-4xl">
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl font-headline text-primary">Customer Support</CardTitle>
                        <CardDescription className="text-lg">We're here to help! Reach out to us with any questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                       {renderContent()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ContactCardSkeleton() {
    return (
        <div className="p-6 border rounded-lg bg-background space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}
