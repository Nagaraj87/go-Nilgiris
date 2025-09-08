
'use client';

import { useEffect, useState } from 'react';
import { getPackagePrices, getTourPackages } from '@/lib/firebase';
import { TourCard } from './tour-card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TourPackage } from '@/types';


export function ToursSection() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);


  useEffect(() => {
    const fetchToursAndPrices = async () => {
      setLoadingTours(true);
      setLoadingPrices(true);
      setError(null);
      try {
        const [packagePrices, packages] = await Promise.all([
           getPackagePrices(),
           getTourPackages()
        ]);

        const pricesMap: Record<string, number> = {};
        packagePrices.forEach(p => {
          pricesMap[p.slug] = p.price;
        });
        setPrices(pricesMap);
        setTourPackages(packages);

      } catch (err) {
        console.error("Failed to load tours or prices on homepage", err);
        setError("Could not load the latest tour data. Please try again later.");
      } finally {
        setLoadingPrices(false);
        setLoadingTours(false);
      }
    };
    fetchToursAndPrices();
  }, []);

  return (
    <section id="tours" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Our Signature Tours</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose your adventure. We offer curated group bus tours to the most iconic destinations in the Nilgiris.
              </p>
            </div>
             {error && (
              <div className="max-w-2xl w-full pt-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Data Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-2 lg:gap-12">
            {loadingTours ? (
              <>
                <div className="w-full h-96 bg-muted rounded-lg animate-pulse"></div>
                <div className="w-full h-96 bg-muted rounded-lg animate-pulse"></div>
              </>
            ) : (
               tourPackages.map((pkg) => (
                <TourCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  price={prices[pkg.slug]} 
                  loading={loadingPrices} 
                />
              ))
            )}
          </div>
        </div>
      </section>
  )
}
