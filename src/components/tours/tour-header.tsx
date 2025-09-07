
import type { TourPackage } from "@/types";
import { Info } from "lucide-react";

type TourHeaderProps = {
    tourPackage: TourPackage;
}

export function TourHeader({ tourPackage }: TourHeaderProps) {
    return (
        <>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{tourPackage.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{tourPackage.overview}</p>
            
            <div className="mt-6 bg-pink-50 border-l-4 border-pink-400 text-pink-800 p-4 rounded-r-lg" role="alert">
                <h3 className="font-bold flex items-center gap-2"><Info size={16}/> Important Notes</h3>
                {tourPackage.disclaimers.map((note, index) => (
                <p key={index} className="mt-2 text-sm">{note}</p>
                ))}
            </div>
        </>
    )
}
