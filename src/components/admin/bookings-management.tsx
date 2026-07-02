"use client";

import { useEffect, useState, useMemo } from "react";
import { getBookings, deleteAllBookings as deleteAllBookingsFromDb } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, Loader2, Trash, Download } from "lucide-react";
import { BookingsTable } from "./bookings-table";
import type { Booking } from "@/types";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";


export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookingsData = await getBookings();
        setBookings(bookingsData as Booking[]);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        setError("Failed to fetch bookings. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((bookings || []).filter(b => b.id !== bookingId));
  }
  
  const handleDeleteAll = async () => {
    try {
      await deleteAllBookingsFromDb();
      setBookings([]);
      toast({ title: "Success", description: "All bookings have been deleted." });
    } catch(e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Could not delete all bookings." });
    } finally {
        setIsDeleteAllOpen(false);
    }
  }

  // Dynamically extract unique package slugs from all loaded bookings
  const uniquePackages = useMemo(() => {
    const pkgs = new Set<string>();
    (bookings || []).forEach((b) => {
      if (b.packageSlug) {
        pkgs.add(b.packageSlug);
      }
    });
    return Array.from(pkgs).sort();
  }, [bookings]);

  // Format slug to a human-readable title (e.g. "ooty-coonoor-tour" -> "Ooty Coonoor Tour")
  const formatPackageName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Perform simultaneous filtering
  const filteredBookings = useMemo(() => {
    return (bookings || []).filter((booking) => {
      // 1. Text Search Filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        booking.bookingId.toLowerCase().includes(query) ||
        booking.packageSlug.toLowerCase().includes(query) ||
        booking.passengers.some((p) => p.name.toLowerCase().includes(query));

      // 2. Package Dropdown Filter
      const matchesPackage =
        selectedPackage === "all" || booking.packageSlug === selectedPackage;

      // 3. Date Input Filter
      const matchesDate =
        selectedDate === "" || booking.bookingDate === selectedDate;

      return matchesSearch && matchesPackage && matchesDate;
    });
  }, [bookings, searchQuery, selectedPackage, selectedDate]);

  // Flag to indicate if any filters are currently active
  const hasActiveFilters = searchQuery !== "" || selectedPackage !== "all" || selectedDate !== "";

  // Generates and downloads a beautifully styled A4 PDF table of bookings matching active filters
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. Title and Document Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(59, 136, 64); // Go Nilgiris Forest Green
    doc.text("Go Nilgiris", 15, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Charcoal grey
    doc.setFont("helvetica", "normal");
    doc.text("Booking Administration Report", 15, 28);

    // 2. Subheader details (date & filters)
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // Slate grey
    const dateStr = new Date().toLocaleDateString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    } as any);
    doc.text(`Generated: ${dateStr}`, 15, 34);

    let filterText = "Active Filters: None";
    if (hasActiveFilters) {
      const parts = [];
      if (searchQuery) parts.push(`Query: "${searchQuery}"`);
      if (selectedPackage !== "all") parts.push(`Package: ${formatPackageName(selectedPackage)}`);
      if (selectedDate) parts.push(`Date: ${selectedDate}`);
      filterText = `Active Filters: ${parts.join(" | ")}`;
    }
    doc.text(filterText, 15, 39);

    // 3. Summary metrics card banner
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPassengers = filteredBookings.reduce((sum, b) => sum + b.memberCount, 0);

    doc.setFillColor(248, 250, 252); // Soft light grey-blue background
    doc.rect(15, 43, 180, 16, "F");
    doc.setDrawColor(226, 232, 240); // Soft border
    doc.rect(15, 43, 180, 16, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    doc.text(`Total Bookings: ${filteredBookings.length}`, 22, 53);
    doc.text(`Total Seats/Members: ${totalPassengers}`, 80, 53);
    doc.text(`Total Revenue: INR ${totalRevenue.toLocaleString("en-IN")}`, 140, 53);

    // 4. AutoTable setup
    const tableHeaders = [["Booking ID", "Tour Package", "Travel Date", "Seats", "Amount", "Primary Passenger"]];
    
    const tableRows = filteredBookings.map((b) => {
      const primaryPassenger = b.passengers[0];
      const passengerName = primaryPassenger ? primaryPassenger.name : "N/A";
      const passengerPhone = primaryPassenger ? primaryPassenger.phone : "";
      const passengerInfo = passengerPhone ? `${passengerName}\n(${passengerPhone})` : passengerName;
      
      let displayDate = b.bookingDate;
      try {
        displayDate = format(new Date(b.bookingDate), "dd MMM yyyy");
      } catch (e) {}

      return [
        b.bookingId,
        formatPackageName(b.packageSlug),
        displayDate,
        b.selectedSeats.map((s) => s.number).join(", "),
        `INR ${b.totalAmount.toLocaleString("en-IN")}`,
        passengerInfo,
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: tableHeaders,
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [59, 136, 64], // Brand green
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        valign: "middle",
        halign: "left"
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        valign: "middle"
      },
      columnStyles: {
        0: { cellWidth: 36 }, // Booking ID
        1: { cellWidth: 40 }, // Tour Package
        2: { cellWidth: 24 }, // Travel Date
        3: { cellWidth: 18 }, // Seats
        4: { cellWidth: 24 }, // Amount
        5: { cellWidth: 38 }, // Primary Passenger
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Footer section
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // Slate 400
        
        doc.text("Confidential - Go Nilgiris Administration Dashboard", 15, 287);
        doc.text(`Page ${data.pageNumber}`, 185, 287);
      }
    });

    // Save and download the PDF
    doc.save(`go_nilgiris_bookings_${new Date().toISOString().slice(0, 10)}.pdf`);

    toast({
      title: "PDF Exported Successfully",
      description: `Downloaded report containing ${filteredBookings.length} booking records.`,
    });
  };

  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading bookings...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <BookingsTable
            bookings={filteredBookings}
            onBookingDeleted={handleDeleteBooking}
            searchQuery={hasActiveFilters ? "active_filters" : ""}
        />
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
                <CardTitle>All Bookings</CardTitle>
                 <CardDescription>
                    View all tour bookings. Use the search and filter options below to narrow results.
                </CardDescription>
            </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="h-9 px-3 text-sm">{filteredBookings.length} booking(s)</Badge>
             
             {/* PDF Export Button */}
             <Button variant="outline" onClick={handleExportPDF} disabled={filteredBookings.length === 0} className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
             </Button>

             <Button variant="destructive" onClick={() => setIsDeleteAllOpen(true)} disabled={(bookings || []).length === 0} className="h-9">
                <Trash className="mr-2 h-4 w-4"/>
                Delete All
             </Button>
          </div>
        </div>
       
        {/* Search and Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Booking ID, package, or passenger name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
              disabled={loading || !!error}
            />
          </div>

          {/* Package Filter */}
          <div className="w-full">
            <Select
              value={selectedPackage}
              onValueChange={setSelectedPackage}
              disabled={loading || !!error}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Tour Packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tour Packages</SelectItem>
                {uniquePackages.map((pkg) => (
                  <SelectItem key={pkg} value={pkg}>
                    {formatPackageName(pkg)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter & Clear Controls */}
          <div className="w-full flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full cursor-pointer"
              disabled={loading || !!error}
            />
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPackage("all");
                  setSelectedDate("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                disabled={loading || !!error}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
     <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all bookings from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">Delete All</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
