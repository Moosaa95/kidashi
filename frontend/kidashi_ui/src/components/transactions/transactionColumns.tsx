import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import type { Transaction } from "@/types/global"

export const transactionColumns: ColumnDef<Transaction>[] = [
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
        accessorKey: "account_name",
        header: "Account Name",
        cell: ({ row }) => <span className="font-medium">{row.original.account_name}</span>,
    },

    {
        accessorKey: "account_number",
        header: "Account Number",
        cell: ({ row }) => <span className="font-medium">{row.original.account_number}</span>,
    },

    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "reference_number",
        header: "Reference Number",
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
    },
    {
        accessorKey: "charges",
        header: "Charges",
    },
    {
        accessorKey: "transaction_type",
        header: "Transaction Type",
    },
    {
        accessorKey: "transaction_date",
        header: "Transaction Date",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${status === "successful"
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
            const tx = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={`/dashboard/transactions/${tx.id}`}>View</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
