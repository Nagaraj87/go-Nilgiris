
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
         <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/20 p-3 rounded-full w-fit">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Something Went Wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-md text-left text-sm">
                        <p className="font-bold">Error Details:</p>
                        <p className="text-muted-foreground">{error.message}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-2">
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                     <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </body>
    </html>
  )
}
