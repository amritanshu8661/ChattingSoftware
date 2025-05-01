"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SimpleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function SimpleDialog({ open, onOpenChange, title, description, children, footer }: SimpleDialogProps) {
  const [isOpen, setIsOpen] = useState(open)

  // Sync with parent state
  useEffect(() => {
    setIsOpen(open)
  }, [open])

  // Notify parent of changes
  const handleClose = () => {
    setIsOpen(false)
    onOpenChange(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />

      {/* Dialog content */}
      <div className="z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="mt-4">{children}</div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  )
}
