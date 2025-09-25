import type { VendorStatus } from "@/types/global"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"


export const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
        case "APPROVED":
            return <CheckCircle className="h-4 w-4 text-primary" />
        case "REJECTED":
            return <XCircle className="h-4 w-4 text-destructive" />
        case "PENDING":
            return <Clock className="h-4 w-4 text-warning" />
        default:
            return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
}

export const getStatusBadge = (status: VendorStatus) => {
    const variants = {
        APPROVED: "default",
        REJECTED: "destructive",
        PENDING: "secondary",
        SUSPENDED: "outline",
    }
    return variants[status] || "outline"
}
