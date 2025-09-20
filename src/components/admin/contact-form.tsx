
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { ContactInfo } from "@/types";

const contactSchema = z.object({
  whatsapp: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
  call: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type ContactFormProps = {
    contactInfo: ContactInfo;
    updateContactInfo: (data: ContactInfo) => Promise<void>;
}

export function ContactForm({ contactInfo, updateContactInfo }: ContactFormProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: contactInfo
    });

    const onSubmit = (data: ContactFormValues) => {
        startTransition(async () => {
             try {
                await updateContactInfo(data);
                toast({ title: "Contact Info Updated", description: "The customer support numbers have been saved." });
            } catch (error) {
                toast({ variant: "destructive", title: "Update Failed", description: "Could not save contact info." });
            }
        });
    }
    
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input
                    id="whatsapp-number"
                    {...form.register("whatsapp")}
                    placeholder="e.g., 8248932947"
                    disabled={isPending}
                />
                {form.formState.errors.whatsapp && <p className="text-destructive text-xs mt-1">{form.formState.errors.whatsapp.message}</p>}
            </div>
            <div>
                <Label htmlFor="call-number">Call Number</Label>
                <Input
                    id="call-number"
                    {...form.register("call")}
                    placeholder="e.g., 7418066906"
                    disabled={isPending}
                />
                 {form.formState.errors.call && <p className="text-destructive text-xs mt-1">{form.formState.errors.call.message}</p>}
            </div>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                {isPending ? <Loader2 className="animate-spin" /> : "Save Contact Info"}
            </Button>
        </form>
    )
}
