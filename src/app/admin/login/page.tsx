
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Lock } from 'lucide-react';


function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" aria-disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>
    )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                     <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" type="text" placeholder="admin" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required />
                    </div>
                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    <LoginButton/>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
