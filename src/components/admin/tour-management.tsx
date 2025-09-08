
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTourPackages } from "@/lib/firebase";
import type { TourPackage } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, PlusCircle, Plane, Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export function TourManagement() {
    const [tours, setTours] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            setError(null);
            try {
                const tourData = await getTourPackages();
                setTours(tourData as TourPackage[]);
            } catch (err) {
                console.error("Failed to fetch tours", err);
                setError("Could not load tour packages. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);
    
    const handleEditTour = (slug: string) => {
        router.push(`/admin/edit-tour/${slug}`);
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-48">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading tour packages...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (tours.length === 0) {
            return (
                <Alert>
                    <Plane className="h-4 w-4" />
                    <AlertTitle>No Tours Found</AlertTitle>
                    <AlertDescription>
                        There are no tour packages in the database. Click "Add New Tour" to create one.
                    </AlertDescription>
                </Alert>
            )
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tour Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tours.map(tour => (
                        <TableRow key={tour.id}>
                            <TableCell className="font-medium">{tour.name}</TableCell>
                            <TableCell>{tour.slug}</TableCell>
                            <TableCell>{tour.duration}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleEditTour(tour.slug)}>
                                    <Pencil className="mr-2"/>
                                    Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Tour Management</CardTitle>
                        <CardDescription>Add, edit, or delete your tour packages.</CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/admin/edit-tour/new">
                            <PlusCircle className="mr-2" />
                            Add New Tour
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
