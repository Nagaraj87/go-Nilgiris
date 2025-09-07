
"use client";

import { useEffect, useState } from "react";
import { getBookings } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar as CalendarIcon, GalleryHorizontal, Lock, Ticket, ShieldOff, ImageOff } from "lucide-react";
import { format } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Booking = {
  id: string;
  bookingId: string;
  packageSlug: string;
  bookingDate: string;
  memberCount: number;
  totalAmount: number;
  passengers: { name: string; age: number; gender: string }[];
  selectedSeats: { number: number; price: number }[];
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await getBookings();
        setBookings(bookingsData as Booking[]);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const bookingCounts = bookings.reduce((acc, booking) => {
    acc[booking.packageSlug] = (acc[booking.packageSlug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(bookingCounts).map(slug => ({
    name: slug.replace(/-/g, ' ').replace('tour', ''),
    bookings: bookingCounts[slug],
  }));

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const handleBlockSeat = () => {
    alert("Seat blocking is a demo feature.");
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-primary h-8 w-8"/>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
       <p className="text-muted-foreground mb-8">Manage your tours, view bookings, and analyze your business performance.</p>
      
      <Tabs defaultValue="bookings">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings"><Ticket className="mr-2"/> Bookings</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart className="mr-2"/> Analytics</TabsTrigger>
          <TabsTrigger value="availability"><ShieldOff className="mr-2"/> Availability</TabsTrigger>
          <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2"/> Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                View all tour bookings submitted through the booking form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading bookings...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Tour Package</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Passengers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.bookingId}</TableCell>
                        <TableCell>{booking.packageSlug}</TableCell>
                        <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                        <TableCell>{booking.memberCount}</TableCell>
                        <TableCell>₹{booking.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{booking.selectedSeats.map(s => s.number).join(', ')}</TableCell>
                        <TableCell>
                          {booking.passengers.map((p, i) => (
                            <div key={i} className="text-xs">
                              {p.name} ({p.age}, {p.gender})
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Analytics</CardTitle>
                    <CardDescription>A summary of tour bookings.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="availability">
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Block Dates</CardTitle>
                        <CardDescription>Select dates to block new bookings, e.g., due to bad weather or holidays.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="multiple"
                            selected={blockedDates}
                            onSelect={setBlockedDates}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Block a Seat</CardTitle>
                        <CardDescription>Manually block a specific seat for a tour on a particular date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="block-seat-number">Seat Number</Label>
                            <Input id="block-seat-number" type="number" placeholder="e.g., 14" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="block-seat-date">Date</Label>
                            <Input id="block-seat-date" type="date" />
                        </div>
                        <Button onClick={handleBlockSeat} variant="destructive">Block Seat</Button>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
         <TabsContent value="gallery">
            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                        <ImageOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">Gallery Management</CardTitle>
                    <CardDescription>This feature is coming soon. You'll be able to upload and manage your tour photos here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Upload Photos</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    