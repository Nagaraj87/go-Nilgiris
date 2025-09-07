import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { tourPackages } from '@/lib/data';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] w-full">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Scenic view of the Nilgiri hills"
          fill
          className="object-cover"
          data-ai-hint="mountain landscape"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl font-headline font-bold md:text-6xl lg:text-7xl">
            Nilgiri Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200 md:text-xl">
            Explore the Nilgiris with Ease – Ooty, Coonoor, Mudhumalai & More!
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="#tours">Browse Tours</Link>
          </Button>
        </div>
      </section>

      <section id="tours" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Our Signature Tours</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose your adventure. We offer curated group bus tours to the most iconic destinations in the Nilgiris.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-2 lg:gap-12">
            {tourPackages.map((pkg) => (
              <Card key={pkg.id} className="w-full transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.overview}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall {pkg.duration} trip</p>
                    <p className="text-3xl font-bold">₹{pkg.price} <span className="text-sm font-normal">onwards</span></p>
                  </div>
                  <ul className="grid gap-2 text-sm">
                    {pkg.inclusions.slice(0, 2).map((item) => (
                       <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{item}</span>
                       </li>
                    ))}
                     <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>And more...</span>
                       </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href={`/tours/${pkg.slug}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
