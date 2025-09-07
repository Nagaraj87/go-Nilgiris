
"use client";

import { useEffect, useState } from "react";
import { getContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ContactInfo = {
    whatsapp: string;
    call: string;
};

export default function ContactPage() {
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getContactInfo()
            .then(data => setContactInfo(data))
            .catch(err => console.error("Failed to load contact info:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-muted/40 py-12 md:py-24">
            <div className="container mx-auto max-w-4xl">
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl font-headline text-primary">Customer Support</CardTitle>
                        <CardDescription className="text-lg">We're here to help! Reach out to us with any questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {loading ? (
                            <>
                                <ContactCardSkeleton />
                                <ContactCardSkeleton />
                            </>
                        ) : contactInfo ? (
                            <>
                                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <MessageSquare className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold">WhatsApp</h3>
                                            <p className="text-muted-foreground">For booking & inquiries</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold my-4 text-center">{contactInfo.whatsapp}</p>
                                    <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                                        <a href={`https://wa.me/91${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                            Chat on WhatsApp
                                        </a>
                                    </Button>
                                </div>
                                
                                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Phone className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold">Call Us</h3>
                                            <p className="text-muted-foreground">Speak to our support team</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold my-4 text-center">{contactInfo.call}</p>
                                    <Button asChild className="w-full">
                                        <a href={`tel:+91${contactInfo.call}`}>
                                            Call Now
                                        </a>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <p className="md:col-span-2 text-center text-red-500">Could not load contact information. Please try again later.</p>
                        )}
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
