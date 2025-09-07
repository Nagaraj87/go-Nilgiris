
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading Tour Details...</p>
        </div>
    </div>
  );
}
