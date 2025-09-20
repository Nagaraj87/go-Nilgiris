

'use server';

import { getTourPackages } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plane, Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export async function TourManagement() {
    const tours = await getTourPackages();

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
                {tours.length === 0 ? (
                    <Alert>
                        <Plane className="h-4 w-4" />
                        <AlertTitle>No Tours Found</AlertTitle>
                        <AlertDescription>
                            There are no tour packages in the database. Click "Add New Tour" to create one.
                        </AlertDescription>
                    </Alert>
                ) : (
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
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/edit-tour/${tour.slug}`}>
                                                <Pencil className="mr-2"/>
                                                Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
