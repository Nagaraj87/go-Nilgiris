
"use client";

import { useEffect, useState } from "react";
import { getContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactCard } from "@/components/contact/contact-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

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
                <div className="md:col-span-2 flex items-center justify-center h-48">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span>Loading contact details...</span>
                    </div>
                </div>
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
