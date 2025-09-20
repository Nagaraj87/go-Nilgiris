
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AdminCredentials } from "@/types";

const credentialsSchema = z.object({
    username: z.string().min(3, "Username is required."),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;

type CredentialsFormProps = {
    credentials: AdminCredentials;
    updateAdminCredentials: (credentials: Partial<AdminCredentials>) => Promise<void>;
}

export function CredentialsForm({ credentials, updateAdminCredentials }: CredentialsFormProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);

    const form = useForm<CredentialsFormValues>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: {
            username: credentials.username,
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = async (data: CredentialsFormValues) => {
        setSaving(true);
        try {
            const updatedCredentials: Partial<AdminCredentials> = {
                username: data.username,
            };
            
            if (data.newPassword) {
                updatedCredentials.password = data.newPassword;
            }
            
            await updateAdminCredentials(updatedCredentials);
            
            toast({ title: "Credentials Updated", description: "Your login details have been saved." });
            form.reset({
                ...form.getValues(),
                newPassword: '',
                confirmPassword: '',
            });

        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save credentials." });
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Password Security</AlertTitle>
                <AlertDescription>
                   Your password is not stored directly. It is securely hashed before being saved to the database. You can only set a new password.
                </AlertDescription>
             </Alert>
            <div>
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    {...form.register("username")}
                    disabled={saving}
                />
                 {form.formState.errors.username && <p className="text-destructive text-xs mt-1">{form.formState.errors.username.message}</p>}
            </div>
            <div>
                <Label htmlFor="new-password">New Password (leave blank to keep current)</Label>
                <Input
                    id="new-password"
                    type="password"
                    {...form.register("newPassword")}
                    placeholder="Enter new password"
                    disabled={saving}
                />
            </div>
             <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="Confirm new password"
                    disabled={saving || !form.watch("newPassword")}
                />
                {form.formState.errors.confirmPassword && <p className="text-destructive text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={saving || !form.formState.isDirty}>
                {saving ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
        </form>
    )
}
