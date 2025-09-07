"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { deleteAllBookings } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

type DeleteAllDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <AlertDialogAction type="submit" disabled={pending} className="bg-destructive hover:bg-destructive/90">
            {pending && <Loader2 className="mr-2 animate-spin" />}
            Delete All Bookings
        </AlertDialogAction>
    )
}

export function DeleteAllDialog({ isOpen, onOpenChange, onSuccess }: DeleteAllDialogProps) {
    const { toast } = useToast();
    const [state, dispatch] = useFormState(deleteAllBookings, undefined);

    useEffect(() => {
        if (state === 'success') {
            toast({ title: "Success", description: "All bookings have been deleted." });
            onSuccess();
        } else if (state) {
             toast({ variant: "destructive", title: "Error", description: state });
        }
    }, [state, toast, onSuccess]);
    
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form action={dispatch}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all bookings from the database. To confirm, please enter your admin credentials below.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 my-4">
                        <div className="space-y-2">
                            <Label htmlFor="username-confirm">Username</Label>
                            <Input id="username-confirm" name="username" type="text" placeholder="admin" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-confirm">Password</Label>
                            <Input id="password-confirm" name="password" type="password" required />
                        </div>
                        {state && state !== 'success' && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{state}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <DeleteButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
