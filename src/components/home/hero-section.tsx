
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
    return (
        <section className="relative h-[60vh] w-full">
            <Image
                src="https://images.pexels.com/photos/33786358/pexels-photo-33786358.jpeg"
                alt="A scenic mountain road in the Nilgiris"
                fill
                className="object-cover"
                data-ai-hint="mountain road"
                priority
                unoptimized
            />
            <div suppressHydrationWarning className="absolute inset-0 bg-black/50" />
            <div suppressHydrationWarning className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-4xl font-headline font-bold md:text-6xl lg:text-7xl">
                    Go Nilgiris
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-gray-200 md:text-xl">
                    Explore the Nilgiris with Ease – Ooty, Coonoor, Mudhumalai & More!
                </p>
                <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="#tours">Browse Tours</Link>
                </Button>
            </div>
        </section>
    )
}
