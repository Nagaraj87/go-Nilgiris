import { getEmergencyConfig } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';

export async function EmergencyBanner() {
  let emergency = null;
  try {
    emergency = await getEmergencyConfig();
  } catch (error) {
    console.error("Failed to load emergency config", error);
  }

  if (!emergency?.isActive) return null;

  return (
    <div className="w-full bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-3 shadow-md z-50 relative">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium text-center sm:text-base">
        <span className="font-bold mr-2 uppercase tracking-wide">Emergency Notice:</span>
        {emergency.message}
      </p>
    </div>
  );
}
