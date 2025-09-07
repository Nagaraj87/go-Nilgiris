import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-primary"/>
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            This is a placeholder for the admin dashboard. A full implementation requires authentication and backend services for managing bookings, payments, and tours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            In a complete application, this area would be protected and provide tools to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>View real-time bookings and payment logs.</li>
            <li>Manage tour packages, itineraries, and galleries.</li>
            <li>Oversee seat availability and make manual adjustments.</li>
            <li>Export booking data for reporting.</li>
            <li>Handle cancellations and customer inquiries.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
