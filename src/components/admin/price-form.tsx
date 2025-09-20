
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
import type { TourPackage } from "@/types";

const priceSchema = z.object({
  price: z.coerce.number().min(1, "Price must be a positive number."),
});

type PriceFormValues = z.infer<typeof priceSchema>;

type PriceFormProps = {
    tourPackage: TourPackage;
    currentPrice: number;
    updatePackagePrice: (slug: string, price: number) => Promise<void>;
}

export function PriceForm({ tourPackage, currentPrice, updatePackagePrice }: PriceFormProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<PriceFormValues>({
        resolver: zodResolver(priceSchema),
        defaultValues: {
            price: currentPrice || tourPackage.price,
        }
    });

    const onSubmit = (data: PriceFormValues) => {
        startTransition(async () => {
            try {
                await updatePackagePrice(tourPackage.slug, data.price);
                toast({ title: "Price Updated", description: `Price for ${tourPackage.name} has been updated.` });
            } catch (error) {
                toast({ variant: "destructive", title: "Update Failed", description: "Could not update the price." });
            }
        });
    }

    return (
         <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
            <div className="mb-4 sm:mb-0">
                <Label htmlFor={`price-${tourPackage.slug}`} className="text-base font-semibold">{tourPackage.name}</Label>
                <p className="text-sm text-muted-foreground">Current Price: ₹{currentPrice?.toLocaleString('en-IN') || 'Not set'}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                    id={`price-${tourPackage.slug}`}
                    type="number"
                    {...form.register("price")}
                    className="w-full sm:w-32"
                    placeholder="New price"
                    disabled={isPending}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : "Save"}
                </Button>
            </div>
            {form.formState.errors.price && <p className="text-destructive text-xs col-span-full">{form.formState.errors.price.message}</p>}
        </form>
    )
}
