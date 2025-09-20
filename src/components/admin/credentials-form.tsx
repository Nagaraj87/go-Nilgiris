
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AdminCredentials } from "@/types";

const credentialsSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters."),
    newPassword: z.string().min(6, "New password must be at least 6 characters.").optional().or(z.literal('')),
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
    const [isPending, startTransition] = useTransition();

    const form = useForm<CredentialsFormValues>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: {
            username: credentials.username,
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = (data: CredentialsFormValues) => {
        startTransition(async () => {
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
            }
        });
    };
    
    const newPasswordValue = form.watch("newPassword");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <Alert>
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Password Security</AlertTitle>
                    <AlertDescription>
                       Your password is not stored directly. It is securely hashed before being saved to the database. You can only set a new password.
                    </AlertDescription>
                 </Alert>
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem><FormLabel>New Password (leave blank to keep current)</FormLabel><FormControl><Input type="password" {...field} placeholder="Enter new password" disabled={isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} placeholder="Confirm new password" disabled={isPending || !newPasswordValue} /></FormControl><FormMessage /></FormItem>
                 )} />
                <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                    {isPending ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
            </form>
        </Form>
    )
}
