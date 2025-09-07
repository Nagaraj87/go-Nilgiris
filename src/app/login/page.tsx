
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {authenticate} from '@/app/actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle, LogIn, Lock} from 'lucide-react';
import {DeerLogo} from '@/components/icons';

function LoginButton() {
  const {pending} = useFormStatus();
  return (
    <Button className="w-full" aria-disabled={pending}>
      {pending ? 'Logging in...' : <><LogIn className="mr-2"/> Sign In</>}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <DeerLogo className="h-8 w-8 text-primary"/>
            </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="admin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}
            <LoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
