"use client"

import { toast as sonnerToast } from "sonner"
import type { ReactNode } from "react"

type ToastOptions = {
  title?: ReactNode
  description?: ReactNode
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

export function useToast() {
  const toast = ({
    title,
    description,
    actionLabel,
    onAction,
    duration = 4000,
  }: ToastOptions) => {
    sonnerToast(title ?? "", {
      description,
      duration,
      action: actionLabel && onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined,
    })
  }

  return { toast }
}
