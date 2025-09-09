
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function TicketPrint() {
    const handlePrint = () => {
        const printContent = document.getElementById('ticketContent');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            // We need to reload to re-attach react event listeners
            window.location.reload(); 
        }
    }
    
    return (
        <Button onClick={handlePrint}>
            <Printer className="mr-2"/>
            Print or Save as PDF
        </Button>
    )
}
