

'use server';

import { getContactInfo, updateContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export async function ContactManagement() {
    const contactInfo = await getContactInfo();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update the customer support contact numbers displayed on the contact page.</CardDescription>
            </CardHeader>
            <CardContent>
                <ContactForm contactInfo={contactInfo} updateContactInfo={updateContactInfo} />
            </CardContent>
        </Card>
    );
}
