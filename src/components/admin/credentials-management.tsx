

"use server";

import { getAdminCredentials, updateAdminCredentials } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialsForm } from "./credentials-form";
import { KeyRound } from "lucide-react";


export async function CredentialsManagement() {
    const credentials = await getAdminCredentials();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                     <KeyRound className="w-6 h-6 text-primary"/>
                     <CardTitle>Admin Credentials</CardTitle>
                </div>
                <CardDescription>Update the username and password used to log in to the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <CredentialsForm 
                    credentials={credentials} 
                    updateAdminCredentials={updateAdminCredentials}
                />
            </CardContent>
        </Card>
    );
}
