import type { VendorStatus } from "@/types/global"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"


export const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
        case "approved":
            return <CheckCircle className="h-4 w-4 text-primary" />
        case "rejected":
            return <XCircle className="h-4 w-4 text-destructive" />
        case "pending":
            return <Clock className="h-4 w-4 text-warning" />
        default:
            return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
}

export const getStatusBadge = (status: VendorStatus) => {
    const variants = {
        approved: "default",
        rejected: "destructive",
        pending: "secondary",
        suspended: "outline",
    }
    return variants[status] || "outline"
}
