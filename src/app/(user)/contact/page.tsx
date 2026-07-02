

export const dynamic = 'force-dynamic';

import { getContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactCard } from "@/components/contact/contact-card";

export default async function ContactPage() {
    const contactInfo = await getContactInfo();

    return (
        <div className="bg-muted/40 py-12 md:py-24">
            <div className="container mx-auto max-w-4xl">
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl font-headline text-primary">Customer Support</CardTitle>
                        <CardDescription className="text-lg">We're here to help! Reach out to us with any questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                       {contactInfo ? (
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
                       ): (
                           <div className="md:col-span-2 text-center text-muted-foreground">
                               Contact information is currently unavailable.
                           </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
