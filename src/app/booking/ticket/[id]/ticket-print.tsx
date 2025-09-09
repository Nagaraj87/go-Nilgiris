
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function TicketPrint() {
    const handlePrint = () => {
        window.print();
    }
    
    return (
        <Button onClick={handlePrint} className="print:hidden">
            <Printer className="mr-2"/>
            Print or Save as PDF
        </Button>
    )
}
