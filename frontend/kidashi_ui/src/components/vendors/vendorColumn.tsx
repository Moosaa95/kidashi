// src/components/vendors/vendorColumns.tsx
import { type ColumnDef } from "@tanstack/react-table"
import type { Vendor } from "@/types/global"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import { Badge } from "../ui/badge"

export const vendorColumns: ColumnDef<Vendor>[] = [
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
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: "phone",
        header: "Phone Number",
    },
    {
        accessorKey: "totalWomen",
        header: "Women",
    },
    {
        accessorKey: "businessType",
        header: "Business Type",
    },
    {
        accessorKey: "trustCirclesCount",
        header: "Trust Circles",
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${status === "approved"
                        ? "bg-green-100 text-green-700"
                        : status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {status}
                </span>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const vendor = row.original
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        asChild
                    >
                        <Link to={`/dashboard/vendors/${vendor.id}`}>View</Link>
                    </Button>
                </div>
            )
        },
    },
]



// women column
export const womenColumns: ColumnDef<any>[] = [
    {
        id: "serial",
        header: "S/N",
        cell: ({ row }) => (
            <div className="font-medium text-primary-800 hidden lg:block">
                {row.index + 1}
            </div>
        ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    {
        accessorKey: "loanAmount", header: "Loan Amount",
        cell: ({ row }) => `₦${row.original.loanAmount.toLocaleString()}`
    },
    {
        accessorKey: "repaymentStatus", header: "Repayment Status",
        cell: ({ row }) => (
            <Badge
                className={
                    row.original.repaymentStatus === "current"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                }
            >
                {row.original.repaymentStatus}
            </Badge>
        )
    },
    {
        accessorKey: "joinDate", header: "Join Date",
        cell: ({ row }) => new Date(row.original.joinDate).toLocaleDateString()
    }
]

// trust circle
export const trustCircleColumns: ColumnDef<any>[] = [
    {
        id: "serial",
        header: "S/N",
        cell: ({ row }) => (
            <div className="font-medium text-primary-800 hidden lg:block">
                {row.index + 1}
            </div>
        ),
    },
    { accessorKey: "name", header: "Circle Name" },
    { accessorKey: "memberCount", header: "Members" },
    {
        accessorKey: "totalLoanAmount", header: "Total Loan Amount",
        cell: ({ row }) => `₦${row.original.totalLoanAmount.toLocaleString()}`
    },
    {
        accessorKey: "repaymentRate", header: "Repayment Rate",
        cell: ({ row }) => `${row.original.repaymentRate}%`
    },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => (
            <Badge>{row.original.status}</Badge>
        )
    }
]

// Documents
export const documentColumns: ColumnDef<any>[] = [
    {
        id: "serial",
        header: "S/N",
        cell: ({ row }) => (
            <div className="font-medium text-primary-800 hidden lg:block">
                {row.index + 1}
            </div>
        ),
    },
    { accessorKey: "name", header: "Document" },
    { accessorKey: "type", header: "Type" },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => (
            <Badge
                className={
                    row.original.status === "verified"
                        ? "bg-success text-success-foreground"
                        : "bg-primary text-primary-foreground"
                }
            >
                {row.original.status}
            </Badge>
        )
    }
]
