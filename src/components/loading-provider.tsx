"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setEstimatedTime(3);
      timer = setInterval(() => {
        setEstimatedTime((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-bold text-foreground">{message}</h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Estimated time: {estimatedTime} {estimatedTime === 1 ? "second" : "seconds"}
          </p>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
