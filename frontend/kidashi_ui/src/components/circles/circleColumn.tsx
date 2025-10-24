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
        accessorKey: "circle_name",
        header: "Circle Name",
    },
    //combined vendor first name and surname to make vendor name
    {
        accessorKey: "vendor_name",
        header: "Vendor Name",
        cell: ({ row }) => <span className="font-medium">{row.original.vendor__first_name} {row.original.vendor__surname}</span>,
    },
    {
        accessorKey: "loan_eligibility",
        header: "Loan Eligibility",
        cell: ({ row }) => {
            const eligibility = row.original.loan_eligibility
            const color = eligibility === "ELIGIBLE" ? "text-green-600" : eligibility === "NOT_ELIGIBLE" ? "text-red-600" : "text-yellow-600"
            return (
                <span className={color}>
                    {eligibility}
                </span>
            )
        },
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
        accessorKey: "current_member_count",
        header: "Women Members",
    },
    {
        accessorKey: "total_asset_amount",
        header: "Total Asset Amount",
        cell: ({ row }) => `₦${(row.original.total_asset_amount || 0).toLocaleString()}`
    },
    // {
    //     accessorKey: "runningLoansCount",
    //     header: "Running Loans",
    //     // cell: ({ row }) => row.original.runningLoansCount.toLocaleString()
    // },
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
                        <Link to={`/trust-circles/${vendor.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
