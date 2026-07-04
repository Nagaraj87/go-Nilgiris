'use client';

import { getEmergencyConfig } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function EmergencyBanner() {
  const [emergency, setEmergency] = useState<{isActive: boolean, message: string} | null>(null);

  useEffect(() => {
    getEmergencyConfig()
      .then(setEmergency)
      .catch((error) => console.error("Failed to load emergency config", error));
  }, []);

  if (!emergency?.isActive) return null;

  return (
    <div className="w-full bg-destructive text-destructive-foreground px-4 py-3 flex items-start sm:items-center justify-center gap-2 sm:gap-3 shadow-md z-50 relative">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
      <div className="text-sm font-medium text-left sm:text-center sm:text-base flex-1 sm:flex-none">
        <span className="font-bold mr-2 uppercase tracking-wide">Emergency Notice:</span>
        {emergency.message}
      </div>
    </div>
  );
}
