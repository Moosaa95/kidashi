import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type ModalProps = {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    size?: "sm" | "md" | "lg"
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
}: ModalProps) {
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={sizeClasses[size]}>
                <DialogHeader>
                    <DialogTitle className="text-primary">{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-4">{children}</div>

                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
