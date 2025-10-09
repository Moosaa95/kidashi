import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router"
import { Eye } from "lucide-react"
import type { WomanSummary } from "@/types/global"

const statusBadgeClass = (status?: string | null) => {
    const normalized = status?.toLowerCase()
    switch (normalized) {
        case "active":
            return "bg-green-100 text-green-800"
        case "inactive":
        case "suspended":
        case "left_circle":
            return "bg-yellow-100 text-yellow-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const repaymentBadgeClass = (status?: string | null) => {
    const normalized = status?.toLowerCase()
    switch (normalized) {
        case "on_time":
        case "paid_off":
            return "bg-blue-100 text-blue-800"
        case "ongoing":
        case "under_review":
            return "bg-purple-100 text-purple-800"
        case "late":
        case "defaulted":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const formatName = (woman: WomanSummary) => {
    const names = [woman.first_name, woman.other_name, woman.surname].filter(Boolean)
    return names.length ? names.join(" ") : "Unnamed"
}

const formatLocation = (woman: WomanSummary) => {
    const parts = [woman.lga, woman.state, woman.country].filter(Boolean)
    return parts.length ? parts.join(", ") : "—"
}

const formatStatusLabel = (value?: string | null, fallback = "Unknown") => {
    if (!value) return fallback
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const womenColumns: ColumnDef<WomanSummary>[] = [
    {
        id: "serial",
        header: "S/N",
        cell: ({ row }) => (
            <div className="font-medium text-primary-800 hidden lg:block">
                {row.index + 1}
            </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
    },
    {
        id: "full_name",
        header: "Name",
        accessorFn: (woman) => formatName(woman),
        cell: ({ row }) => {
            const woman = row.original
            return (
                <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{formatName(woman)}</p>
                    <p className="text-xs text-muted-foreground">{woman.mobile_number || "No phone"}</p>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
    },
    {
        accessorKey: "account_number",
        header: "Account Number",
        cell: ({ row }) => row.original.account_number || "—",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge className={`${statusBadgeClass(row.original.status)} capitalize`}>
                {formatStatusLabel(row.original.status)}
            </Badge>
        ),
    },
    {
        accessorKey: "repayment_status",
        header: "Repayment",
        cell: ({ row }) => (
            <Badge className={`${repaymentBadgeClass(row.original.repayment_status)} capitalize`}>
                {formatStatusLabel(row.original.repayment_status, "N/A")}
            </Badge>
        ),
    },
    {
        id: "location",
        header: "Location",
        cell: ({ row }) => formatLocation(row.original),
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
            const woman = row.original
            return (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/women/${woman.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
