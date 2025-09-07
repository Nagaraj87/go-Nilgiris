
"use client";

import { useEffect, useState } from "react";
import { getContactInfo, updateContactInfo } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ContactInfo = {
    whatsapp: string;
    call: string;
};

export function ContactManagement() {
    const { toast } = useToast();
    const [contactInfo, setContactInfo] = useState<ContactInfo>({ whatsapp: '', call: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContact = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getContactInfo();
                if(data) {
                   setContactInfo(data);
                } else {
                   setError("Could not load contact info. Default values may be displayed.");
                   setContactInfo({ whatsapp: '8248932947', call: '7418066906' }); // Fallback
                }
            } catch (err) {
                console.error(err);
                setError("Could not load contact info. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, []);

    const handleSaveContact = async () => {
        setSaving(true);
        try {
            await updateContactInfo(contactInfo);
            toast({ title: "Contact Info Updated", description: "The customer support numbers have been saved." });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save contact info." });
        } finally {
            setSaving(false);
        }
    };
    
    const renderContent = () => {
        if(loading) {
            return (
                <div className="flex items-center justify-center h-48">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading contact info...</span>
                    </div>
                </div>
            )
        }
        if(error && !contactInfo.whatsapp) { // only show blocking error if there is no fallback
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )
        }
        return (
            <div className="space-y-4">
                 {error && ( // Show non-blocking error
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Loading Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                 )}
                <div>
                    <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                    <Input
                        id="whatsapp-number"
                        value={contactInfo.whatsapp}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="e.g., 8248932947"
                        disabled={saving}
                    />
                </div>
                <div>
                    <Label htmlFor="call-number">Call Number</Label>
                    <Input
                        id="call-number"
                        value={contactInfo.call}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, call: e.target.value }))}
                        placeholder="e.g., 7418066906"
                        disabled={saving}
                    />
                </div>
                <Button onClick={handleSaveContact} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : "Save Contact Info"}
                </Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update the customer support contact numbers displayed on the contact page.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
