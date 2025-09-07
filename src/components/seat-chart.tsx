
"use client";

import { cn } from "@/lib/utils";
import { Armchair, User, Ban } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type SeatStatus = "available" | "sold" | "selected" | "blocked";

type Seat = {
  id: string;
  number: number;
  status: SeatStatus;
  price: number;
};

type SeatChartProps = {
  totalSeats: number;
  seatsPerRow: number;
  memberCount: number;
  selectedSeats: Seat[];
  onSeatSelect: (selection: any, isSelected: boolean) => void;
  pricePerSeat: number;
  occupiedSeats?: number[];
  adminBlockedSeats?: number[];
  isBlockingMode?: boolean;
};

const generateSeats = (totalSeats: number, pricePerSeat: number): Seat[] => {
  return Array.from({ length: totalSeats }, (_, i) => {
    return {
      id: `seat-${i + 1}`,
      number: i + 1,
      status: "available",
      price: pricePerSeat,
    }
  });
};

export function SeatChart({
  totalSeats,
  seatsPerRow,
  memberCount,
  selectedSeats,
  onSeatSelect,
  pricePerSeat,
  occupiedSeats = [],
  adminBlockedSeats = [],
  isBlockingMode = false,
}: SeatChartProps) {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    setSeats(generateSeats(totalSeats, pricePerSeat));
  }, [totalSeats, pricePerSeat]);


  const handleSeatClick = (seat: Seat, status: SeatStatus) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isBlockingMode) {
      onSeatSelect(seat.number, isSelected);
      return;
    }
    
    // Normal booking mode logic
    if (status === 'sold' || status === 'blocked') return;

    onSeatSelect(seat, isSelected);
  };

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (occupiedSeats.includes(seat.number)) return "sold";
    if (adminBlockedSeats.includes(seat.number)) return "blocked";
    if (selectedSeats.some(s => s.id === seat.id)) return "selected";
    return "available";
  }

  const seatsWithAisles = useMemo(() => {
    const newSeats: (Seat | null)[] = [];
    const aisleIndex = Math.ceil(seatsPerRow / 2);
    for (let i = 0; i < seats.length; i++) {
        newSeats.push(seats[i]);
        if ((i + 1) % seatsPerRow === aisleIndex && (i + 1) < seats.length) {
            newSeats.push(null); // Aisle marker
        }
    }
    return newSeats;
  }, [seats, seatsPerRow]);

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Reservation Seat Chart</CardTitle>
        <CardDescription>
            {isBlockingMode
                ? "Click a seat to block or unblock it. Sold seats cannot be blocked."
                : `Select seats for ${memberCount} member(s). Click on an available seat to select it.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 p-4 rounded-lg flex justify-center">
            <div className="w-fit">
                <div className="mx-auto w-16 h-16 border-2 border-muted-foreground rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 21h4"/><path d="M5 21h14"/><path d="M12 17a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2Z"/><path d="M12 17a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z"/><path d="M17 15V9a5 5 0 0 0-5-5h-1a5 5 0 0 0-5 5v6"/><path d="M6 9h13"/></svg>
                </div>
                <div className={cn("grid gap-2")} style={{ gridTemplateColumns: `repeat(${seatsPerRow + (seats.length > seatsPerRow ? 1: 0)}, minmax(0, 1fr))` }}>
                  {seatsWithAisles.map((seat, index) => {
                    if (seat === null) {
                      return <div key={`aisle-${index}`} className="w-full"></div>; // Aisle space
                    }
                    const status = getSeatStatus(seat);
                    return <SeatButton key={seat.id} seat={seat} status={status} onClick={handleSeatClick} isBlockingMode={isBlockingMode} />;
                  })}
                </div>
            </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary"></div>Available</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-accent"></div>Selected</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-muted text-muted-foreground flex items-center justify-center"><User size={12}/></div>Sold</div>
          {isBlockingMode && (
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-destructive/80 text-destructive-foreground flex items-center justify-center"><Ban size={12}/></div>Blocked</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SeatButton({ seat, status, onClick, isBlockingMode }: { seat: Seat, status: SeatStatus, onClick: (seat: Seat, status: SeatStatus) => void, isBlockingMode: boolean }) {
  
  const getIcon = () => {
    if (status === 'sold') return <User size={16}/>;
    if (status === 'blocked') return <Ban size={16}/>;
    return <Armchair size={16}/>;
  }
  
  const buttonContent = (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-10 flex flex-col items-center justify-center text-xs rounded-md",
        status === "available" && "bg-primary/20 text-primary-foreground hover:bg-primary/30",
        status === "sold" && "bg-muted text-muted-foreground cursor-not-allowed",
        status === "blocked" && "bg-destructive/80 text-destructive-foreground",
        status === "selected" && "bg-accent text-accent-foreground hover:bg-accent/90",
        !isBlockingMode && (status === "blocked" || status === "sold") && "cursor-not-allowed"
      )}
      onClick={() => onClick(seat, status)}
      disabled={!isBlockingMode && (status === "sold" || status === "blocked")}
      aria-label={`Seat ${seat.number}, Status: ${status}, Price: ₹${seat.price}`}
    >
      {getIcon()}
      <span className="text-[10px]">{seat.number}</span>
    </Button>
  );

  return (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
                <p>Seat {seat.number}</p>
                <p>Price: ₹{seat.price}</p>
                <p>Status: {status}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}
