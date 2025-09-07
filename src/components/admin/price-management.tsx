
"use client";

import { useEffect, useState } from "react";
import { getPackagePrices, updatePackagePrice } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { tourPackages } from "@/lib/data";

type Prices = Record<string, number>;
type UpdatedPrices = Record<string, number | string>;

export function PriceManagement() {
    const { toast } = useToast();
    const [prices, setPrices] = useState<Prices>({});
    const [loading, setLoading] = useState(true);
    const [updatedPrices, setUpdatedPrices] = useState<UpdatedPrices>({});
    const [savingSlug, setSavingSlug] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            setError(null);
            try {
                const packagePrices = await getPackagePrices();
                const pricesMap: Prices = {};
                packagePrices.forEach(p => {
                    pricesMap[p.slug] = p.price;
                });
                setPrices(pricesMap);
                setUpdatedPrices(pricesMap);
            } catch (err) {
                console.error("Failed to fetch prices", err);
                setError("Failed to load package prices. Please try refreshing the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchPrices();
    }, []);

    const handlePriceChange = (slug: string, value: string) => {
        setUpdatedPrices(prev => ({ ...prev, [slug]: value }));
    }

    const handleSavePrice = async (slug: string) => {
        const newPrice = Number(updatedPrices[slug]);
        if (isNaN(newPrice) || newPrice <= 0) {
            toast({ variant: "destructive", title: "Invalid Price", description: "Please enter a valid positive number." });
            return;
        }
        setSavingSlug(slug);
        try {
            await updatePackagePrice(slug, newPrice);
            setPrices(prev => ({ ...prev, [slug]: newPrice }));
            toast({ title: "Price Updated", description: `Price for ${slug} has been updated.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update the price." });
        } finally {
            setSavingSlug(null);
        }
    }

    const renderContent = () => {
        if (loading) {
            return <Skeleton className="h-40 w-full" />
        }
        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )
        }

        return tourPackages.map(pkg => (
            <div key={pkg.slug} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div className="mb-4 sm:mb-0">
                    <Label htmlFor={`price-${pkg.slug}`} className="text-base font-semibold">{pkg.name}</Label>
                    <p className="text-sm text-muted-foreground">Current Price: ₹{prices[pkg.slug]?.toLocaleString('en-IN') || 'Not set'}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                        id={`price-${pkg.slug}`}
                        type="number"
                        value={updatedPrices[pkg.slug] ?? ''}
                        onChange={(e) => handlePriceChange(pkg.slug, e.target.value)}
                        className="w-full sm:w-32"
                        placeholder="New price"
                        disabled={savingSlug === pkg.slug}
                    />
                    <Button onClick={() => handleSavePrice(pkg.slug)} disabled={savingSlug === pkg.slug}>
                        {savingSlug === pkg.slug ? <Loader2 className="animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>
        ))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Package Pricing</CardTitle>
                <CardDescription>Set the base price for each tour package. This will be reflected on the tour and booking pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
