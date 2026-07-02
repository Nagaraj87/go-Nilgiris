"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

function RouteChangeListener({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  return null;
}

type LoadingContextType = {
  isLoading: boolean;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Loading...");
  const [estimatedTime, setEstimatedTime] = useState(3);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (isLoading) {
      setEstimatedTime(3);
      setProgress(0);

      // Countdown timer for estimated seconds
      timer = setInterval(() => {
        setEstimatedTime((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      // Smooth progress bar simulation over 3 seconds
      const startTime = Date.now();
      const totalDuration = 3000; // 3 seconds

      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / totalDuration) * 100, 98);
        setProgress(percentage);
      }, 30);
    } else {
      setProgress(0);
    }

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [isLoading]);

  const isPayment = message.toLowerCase().includes("payment") || message.toLowerCase().includes("gateway");

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        showLoader: (msg) => {
          setMessage(msg || "Loading...");
          setIsLoading(true);
        },
        hideLoader: () => setIsLoading(false),
      }}
    >
      {children}
      <Suspense fallback={null}>
        <RouteChangeListener setIsLoading={setIsLoading} />
      </Suspense>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 dark:bg-background/70 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-sm bg-card/90 dark:bg-card/80 border border-border/80 shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300">
            {/* Ambient background glows */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

            {/* Glowing Icon Container */}
            <div className="relative flex items-center justify-center w-20 h-20 mb-6">
              {/* Pulsing glow aura */}
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
              
              {/* Rotating outer ring */}
              <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              
              {/* Inner static/pulsing icon container */}
              <div className="relative flex items-center justify-center w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full text-primary">
                {isPayment ? (
                  <Lock className="w-6 h-6 animate-pulse" />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin" />
                )}
              </div>
            </div>

            {/* Loading text messages */}
            <h2 className="text-lg md:text-xl font-semibold text-foreground leading-snug tracking-tight mb-2 px-1">
              {message}
            </h2>

            {/* Progress bar container */}
            <div className="w-full mt-4 space-y-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <span>
                  Estimated: {estimatedTime} {estimatedTime === 1 ? "second" : "seconds"}
                </span>
                <span className="font-semibold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Additional secure indicator for payments */}
            {isPayment && (
              <p className="text-[10px] text-muted-foreground/80 mt-4 flex items-center justify-center gap-1.5 border-t border-border/50 pt-3 w-full">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                <span>Secured with 256-bit SSL encryption</span>
              </p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);

