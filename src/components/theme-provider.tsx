
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
        {...props}
        themes={['light', 'dark', 'system', 'forest', 'forest-dark', 'sunset', 'sunset-dark', 'indigo', 'indigo-dark', 'rose', 'rose-dark', 'mocha', 'mocha-dark']}
    >
        {children}
    </NextThemesProvider>
    )
}
