
"use client";

import { useEffect, useState } from "react";
import { getAdminSecretPath, updateAdminSecretPath } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, KeyRound, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";


export function CredentialsManagement() {
    const { toast } = useToast();
    const router = useRouter();
    const [secretPath, setSecretPath] = useState('');
    const [newSecretPath, setNewSecretPath] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCredentials = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAdminSecretPath();
                setSecretPath(data);
                setNewSecretPath(data);
            } catch (err) {
                console.error(err);
                setError("Could not load current secret path.");
            } finally {
                setLoading(false);
            }
        };
        fetchCredentials();
    }, []);

    const handleSaveChanges = async () => {
        if (!newSecretPath || newSecretPath.length < 10) {
            toast({ variant: "destructive", title: "Invalid Path", description: "Secret path must be at least 10 characters long." });
            return;
        }

        setSaving(true);
        try {
            await updateAdminSecretPath(newSecretPath);
            toast({ title: "Secret Path Updated", description: "Your admin URL has been changed." });
            setSecretPath(newSecretPath);
            // Redirect to the new path after update
            router.push(`/admin?secret=${newSecretPath}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save the new secret path." });
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
                        <span>Loading...</span>
                    </div>
                </div>
            )
        }
        if(error) {
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
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                       Changing this path will require you to navigate to the new URL with the new secret query parameter. Bookmark the new URL carefully.
                    </AlertDescription>
                 </Alert>
                <div>
                    <Label htmlFor="secret-path">Admin Secret Path</Label>
                    <Input
                        id="secret-path"
                        value={newSecretPath}
                        onChange={(e) => setNewSecretPath(e.target.value)}
                        disabled={saving}
                        placeholder="Enter a new secret path"
                    />
                </div>

                <Button onClick={handleSaveChanges} disabled={saving || newSecretPath === secretPath}>
                    {saving ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                     <KeyRound className="w-6 h-6 text-primary"/>
                     <CardTitle>Admin Security</CardTitle>
                </div>
                <CardDescription>Update the secret path used to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
