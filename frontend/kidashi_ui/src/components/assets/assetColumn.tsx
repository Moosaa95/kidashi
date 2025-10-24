import type { ColumnDef } from "@tanstack/react-table"
import type { Asset } from "@/types/global"
import { Button } from "../ui/button"
import { Link } from "react-router"
import { Eye } from "lucide-react"
import { Badge } from "../ui/badge"

export const assetColumns: ColumnDef<Asset>[] = [
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
        header: "Asset Name",
        cell: ({ row }) => row.original.name || "N/A",
    },
    {
        accessorKey: "woman_name",
        header: "Woman",
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.woman__first_name} {row.original.woman__surname}
            </span>
        ),
    },
    {
        accessorKey: "woman__trust_circle__circle_name",
        header: "Trust Circle",
    },
    {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => `₦${row.original.value.toLocaleString()}`,
    },
    {
        accessorKey: "markup",
        header: "Markup",
        cell: ({ row }) => `₦${row.original.markup.toLocaleString()}`,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            const colorMap: Record<string, string> = {
                REQUESTED: "bg-yellow-100 text-yellow-800",
                QUERIED: "bg-blue-100 text-blue-800",
                APPROVED: "bg-green-100 text-green-800",
                REJECTED: "bg-red-100 text-red-800",
                FAILED: "bg-red-100 text-red-800",
                CLOSED: "bg-gray-100 text-gray-800",
                RUNNING: "bg-green-100 text-green-800",
            }
            return (
                <Badge className={colorMap[status] || "bg-gray-100 text-gray-800"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const asset = row.original
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        asChild
                    >
                        <Link to={`/assets/${asset.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
