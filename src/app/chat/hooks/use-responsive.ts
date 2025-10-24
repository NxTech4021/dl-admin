"use client"

import { useEffect, useState } from "react"

// Tailwind's default breakpoints (you can sync with tailwind.config.js if customized)
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useResponsive(
  query: "up" | "down" | "between" | "only",
  start: keyof typeof breakpoints,
  end?: keyof typeof breakpoints
) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    let mediaQuery: MediaQueryList

    if (query === "up") {
      mediaQuery = window.matchMedia(`(min-width: ${breakpoints[start]}px)`)
    } else if (query === "down") {
      mediaQuery = window.matchMedia(`(max-width: ${breakpoints[start] - 0.05}px)`)
    } else if (query === "between" && end) {
      mediaQuery = window.matchMedia(
        `(min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.05}px)`
      )
    } else {
      // "only"
      const min = breakpoints[start]
      const keys = Object.keys(breakpoints) as (keyof typeof breakpoints)[]
      const startIndex = keys.indexOf(start)
      const nextKey = keys[startIndex + 1]
      const max = nextKey ? breakpoints[nextKey] - 0.05 : Infinity

      mediaQuery = window.matchMedia(
        `(min-width: ${min}px) and (max-width: ${max}px)`
      )
    }

    const handleChange = () => setMatches(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [query, start, end])

  return matches
}
