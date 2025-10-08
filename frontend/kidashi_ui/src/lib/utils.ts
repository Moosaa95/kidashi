import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { data?: unknown; error?: string; message?: string }
    if (maybeError.data && typeof maybeError.data === "object") {
      const data = maybeError.data as Record<string, unknown>
      if (typeof data.message === "string") {
        return data.message
      }
      if (typeof data.detail === "string") {
        return data.detail
      }
    }
    if (typeof maybeError.message === "string") {
      return maybeError.message
    }
    if (typeof maybeError.error === "string") {
      return maybeError.error
    }
  }
  return fallback
}

export const statusVariants: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-gray-100 text-gray-800",
  inactive: "bg-gray-100 text-gray-800",
}



export const getStatusBadgeClass = (status?: string) => {
  if (!status) return "bg-muted text-muted-foreground"
  return statusVariants[status.toLowerCase()] ?? "bg-muted text-muted-foreground"
}

export const formatStatusLabel = (status?: string) => {
  if (!status) return "Unknown"
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\w/g, (char) => char.toUpperCase())
}

export const formatMembershipDuration = (createdAt?: string) => {
  if (!createdAt) return "N/A"
  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return "N/A"

  const now = new Date()
  const diffInMs = now.getTime() - createdDate.getTime()
  const diffInDays = Math.max(1, Math.floor(diffInMs / (1000 * 60 * 60 * 24)))

  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"}`
  }

  const years = Math.floor(diffInMonths / 12)
  const remainingMonths = diffInMonths % 12

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? "" : "s"}`
  }

  return `${years} yr${years > 1 ? "s" : ""} ${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`
}
