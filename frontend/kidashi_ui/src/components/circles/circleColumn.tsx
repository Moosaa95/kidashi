import type { ColumnDef } from "@tanstack/react-table"
import type { TrustCircles } from "@/types/global"
import { Button } from "../ui/button"
import { Link } from "react-router"
import { Eye } from "lucide-react"

export const circleColumns: ColumnDef<TrustCircles>[] = [
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
        header: "Circle Name",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor",
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "eligibleForLoan",
        header: "Loan Eligibility",
        cell: ({ row }) => (
            <span
                className={row.original.eligibleForLoan ? "text-green-600" : "text-red-600"}
            >
                {row.original.eligibleForLoan ? "Eligible" : "Ineligible"}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            const color =
                status === "active"
                    ? "text-green-600"
                    : status !== "inactive"
                        ? "text-yellow-600"
                        : "text-gray-500"
            return <span className={color}>{status}</span>
        },
    },
    {
        accessorKey: "womenCount",
        header: "Women Members",
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
                        <Link to={`/dashboard/trust-circles/${vendor.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
