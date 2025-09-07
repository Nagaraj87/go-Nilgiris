
"use client";

import { useEffect, useState } from "react";
import { getAdminCredentials, updateAdminCredentials } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, KeyRound, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AdminCredentials } from "@/types";

export function CredentialsManagement() {
    const { toast } = useToast();
    const [credentials, setCredentials] = useState<AdminCredentials>({ username: '', password: '' });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCredentials = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAdminCredentials();
                setCredentials(data);
            } catch (err) {
                console.error(err);
                setError("Could not load current credentials.");
            } finally {
                setLoading(false);
            }
        };
        fetchCredentials();
    }, []);

    const handleSaveChanges = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match" });
            return;
        }

        setSaving(true);
        try {
            const updatedCredentials = {
                username: credentials.username,
                password: newPassword || credentials.password,
            };
            await updateAdminCredentials(updatedCredentials);
            toast({ title: "Credentials Updated", description: "Your login details have been saved." });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save credentials." });
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
                       For demonstration purposes, the password is not hashed. In a production environment, always use a secure password hashing method.
                    </AlertDescription>
                 </Alert>
                <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        disabled={saving}
                    />
                </div>
                <div>
                    <Label htmlFor="new-password">New Password (leave blank to keep current)</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={saving}
                    />
                </div>
                 <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={saving || !newPassword}
                    />
                </div>
                <Button onClick={handleSaveChanges} disabled={saving}>
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
                     <CardTitle>Admin Credentials</CardTitle>
                </div>
                <CardDescription>Update the username and password used to log in to the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
