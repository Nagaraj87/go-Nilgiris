
'use client';

import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";

type ContactCardProps = {
    type: "WhatsApp" | "Call";
    description: string;
    contactNumber: string;
    link: string;
    buttonText: string;
}

export function ContactCard({ type, description, contactNumber, link, buttonText }: ContactCardProps) {
    const isWhatsApp = type === "WhatsApp";
    const Icon = isWhatsApp ? MessageSquare : Phone;

    return (
        <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${isWhatsApp ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Icon className={`h-8 w-8 ${isWhatsApp ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div>
                    <h3 className="text-2xl font-semibold">{type}</h3>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>
            <p className="text-3xl font-bold my-4 text-center">{contactNumber}</p>
            <Button asChild className={`w-full ${isWhatsApp ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {buttonText}
                </a>
            </Button>
        </div>
    );
}
