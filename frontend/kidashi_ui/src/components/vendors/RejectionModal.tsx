import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface RejectionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    isLoading?: boolean
    vendorName?: string
}

export default function RejectionModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    vendorName = "this vendor"
}: RejectionModalProps) {
    const [rejectionReason, setRejectionReason] = useState("")
    const [error, setError] = useState("")

    const handleConfirm = () => {
        if (!rejectionReason.trim()) {
            setError("Rejection reason is required")
            return
        }

        if (rejectionReason.trim().length < 10) {
            setError("Rejection reason must be at least 10 characters")
            return
        }

        onConfirm(rejectionReason.trim())
    }

    const handleClose = () => {
        setRejectionReason("")
        setError("")
        onClose()
    }

    const handleReasonChange = (value: string) => {
        setRejectionReason(value)
        if (error) setError("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Reject Vendor Application
                    </DialogTitle>
                    <DialogDescription>
                        You are about to reject the application for <strong>{vendorName}</strong>.
                        Please provide a reason for the rejection.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="rejection-reason">
                        Rejection Reason <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="rejection-reason"
                        placeholder="Enter the reason for rejecting this vendor application..."
                        value={rejectionReason}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        rows={4}
                        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                        disabled={isLoading}
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Minimum 10 characters required
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading || !rejectionReason.trim()}
                    >
                        {isLoading ? "Rejecting..." : "Reject Vendor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
