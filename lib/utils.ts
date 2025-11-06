import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCategories(value: unknown): string[] | null {
  if (value == null) return null

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)

    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        return normalizeCategories(parsed)
      } catch {
        /* noop */
      }
    }

    const normalized = trimmed
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter((item) => item.length > 0)

    return normalized.length > 0 ? normalized : null
  }

  return null
}
