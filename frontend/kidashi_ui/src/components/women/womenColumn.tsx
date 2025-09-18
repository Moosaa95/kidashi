import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router"
import { Eye } from "lucide-react"
import type { WomenMember } from "@/types/global"


export const womenColumns: ColumnDef<WomenMember>[] = [
    {
        id: "serial",
        header: "S/N",
        cell: ({ row }) => (
            <div className="font-medium text-primary-800 hidden lg:block">
                {row.index + 1}
            </div>
        ),
    },

    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const woman = row.original
            return (
                <div>
                    <p className="font-medium">{woman.name}</p>
                    <p className="text-xs text-muted-foreground">{woman.phone}</p>
                </div>
            )
        },
    },
    {
        accessorKey: "vendorName",
        header: "Vendor",
    },
    {
        accessorKey: "circleName",
        header: "Trust Circle",
    },
    {
        accessorKey: "loanAmount",
        header: "Loan Amount",
        cell: ({ row }) => {
            const woman = row.original
            return (
                <span>
                    {woman.loanAmount > 0 ? `₦${woman.loanAmount.toLocaleString()}` : "—"}
                </span>
            )
        },
    },
    {
        accessorKey: "repaymentStatus",
        header: "Repayment Status",
        cell: ({ row }) => {
            const status = row.original.repaymentStatus
            return (
                <Badge
                    variant={
                        status === "current"
                            ? "default"
                            : status === "overdue"
                                ? "destructive"
                                : "secondary"
                    }
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "joinDate",
        header: "Join Date",
        cell: ({ row }) => {
            return new Date(row.original.joinDate).toLocaleDateString()
        },
    },
    {
        id: "actions",
        header: "Actions",
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
