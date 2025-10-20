import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export interface Staff {
    id: string
    first_name: string
    surname: string
    other_name?: string
    email: string
    phone: string
    role: string
    status: "active" | "inactive" | "suspended"
    department?: string
    created_at: string
    last_login?: string
}

const statusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
        case "active":
            return "bg-green-100 text-green-800"
        case "inactive":
            return "bg-gray-100 text-gray-800"
        case "suspended":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const roleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
        case "admin":
        case "super_admin":
            return "bg-purple-100 text-purple-800"
        case "manager":
            return "bg-blue-100 text-blue-800"
        case "staff":
            return "bg-cyan-100 text-cyan-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const formatName = (staff: Staff) => {
    const names = [staff.first_name, staff.other_name, staff.surname].filter(Boolean)
    return names.length ? names.join(" ") : "Unnamed"
}

const formatRole = (role: string) => {
    return role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const staffColumns: ColumnDef<Staff>[] = [
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
        accessorFn: (staff) => formatName(staff),
        cell: ({ row }) => {
            const staff = row.original
            return (
                <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{formatName(staff)}</p>
                    <p className="text-xs text-muted-foreground">{staff.email}</p>
                </div>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ row }) => row.original.phone || "—",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge className={`${roleBadgeClass(row.original.role)} capitalize`}>
                {formatRole(row.original.role)}
            </Badge>
        ),
    },
    {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department || "—",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge className={`${statusBadgeClass(row.original.status)} capitalize`}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ row }) => {
            const lastLogin = row.original.last_login
            if (!lastLogin) return "Never"
            return new Date(lastLogin).toLocaleDateString()
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        cell: () => {
            // const staff = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Staff
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
