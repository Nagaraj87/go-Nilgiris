"use client";

import { cn } from "@/lib/utils";
import { Armchair, User, PersonStanding, Child, Wheelchair } from "lucide-react";
import { useState, useEffect } from "react";

type SeatStatus = "available" | "sold" | "selected";

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
  onSeatSelect: (seats: Seat[]) => void;
  pricePerSeat: number;
};

const generateSeats = (totalSeats: number, pricePerSeat: number): Seat[] => {
  return Array.from({ length: totalSeats }, (_, i) => {
    const isWindow = i % 4 === 0 || i % 4 === 3;
    const price = pricePerSeat + (isWindow ? 50 : 0) + Math.floor(Math.random() * 50 - 25);
    return {
      id: `seat-${i + 1}`,
      number: i + 1,
      status: Math.random() > 0.4 ? "sold" : "available", // 60% sold for realism
      price: Math.round(price / 10) * 10,
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
}: SeatChartProps) {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    setSeats(generateSeats(totalSeats, pricePerSeat));
  }, [totalSeats, pricePerSeat]);


  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "sold") return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length < memberCount) {
        onSeatSelect([...selectedSeats, seat]);
      } else {
        // Optional: show a toast or alert that the user can't select more seats
        console.warn("Cannot select more seats than the number of members.");
      }
    }
  };

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (selectedSeats.some(s => s.id === seat.id)) {
        return "selected";
    }
    return seat.status;
  }

  const getSeatIcon = (status: SeatStatus) => {
    switch (status) {
      case "sold":
        return <User className="w-4 h-4" />;
      case "selected":
        return <PersonStanding className="w-4 h-4" />;
      default:
        return <Armchair className="w-4 h-4" />;
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Reservation Seat Chart</CardTitle>
        <CardDescription>Select seats for {memberCount} member(s). Click on an available seat to select it.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="mx-auto w-fit">
            <div className="w-64 h-16 border-2 border-muted-foreground rounded-t-full rounded-b-md flex items-center justify-center mb-4">
              <Wheelchair className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className={cn("grid gap-2")} style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))` }}>
              {seats.map((seat, index) => {
                const status = getSeatStatus(seat);
                
                // Add an aisle space
                if (index > 0 && index % seatsPerRow === Math.floor(seatsPerRow/2)) {
                  return (
                    <React.Fragment key={`aisle-${index}`}>
                      <div />
                      <SeatButton seat={seat} status={status} onClick={handleSeatClick} />
                    </React.Fragment>
                  );
                }
                
                return <SeatButton key={seat.id} seat={seat} status={status} onClick={handleSeatClick} />;
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 border border-primary"></div>Available</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-accent"></div>Selected</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-muted"></div>Sold</div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import React from "react";

function SeatButton({ seat, status, onClick }: { seat: Seat, status: SeatStatus, onClick: (seat: Seat) => void }) {
  const icon = status === 'sold' ? <User size={16}/> : <Armchair size={16}/>;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-10 flex flex-col items-center justify-center text-xs",
        status === "available" && "bg-primary/20 text-primary-foreground hover:bg-primary/30",
        status === "sold" && "bg-muted text-muted-foreground cursor-not-allowed",
        status === "selected" && "bg-accent text-accent-foreground hover:bg-accent/90"
      )}
      onClick={() => onClick(seat)}
      disabled={status === "sold"}
      aria-label={`Seat ${seat.number}, Status: ${status}, Price: ₹${seat.price}`}
    >
      {icon}
      <span className="text-[10px]">{seat.number}</span>
    </Button>
  )
}
