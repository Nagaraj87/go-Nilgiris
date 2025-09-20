

'use server';

import { getPackagePrices, updatePackagePrice, getTourPackages } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceForm } from "./price-form";

export async function PriceManagement() {
    const [packagePrices, packages] = await Promise.all([getPackagePrices(), getTourPackages()]);
    
    const pricesMap: Record<string, number> = {};
    packagePrices.forEach(p => {
        pricesMap[p.slug] = p.price;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Package Pricing</CardTitle>
                <CardDescription>Set the base price for each tour package. This will be reflected on the tour and booking pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {packages.map(pkg => (
                    <PriceForm 
                        key={pkg.slug}
                        tourPackage={pkg}
                        currentPrice={pricesMap[pkg.slug]}
                        updatePackagePrice={updatePackagePrice}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
