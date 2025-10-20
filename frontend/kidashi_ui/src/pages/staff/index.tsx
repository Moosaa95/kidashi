import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/datatable"
import { staffColumns, type Staff } from "@/components/staff/staffColumn"
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    Plus,
} from "lucide-react"

// Mock data for demonstration
const mockStaffData: Staff[] = [
    {
        id: "1",
        first_name: "Ahmed",
        surname: "Bello",
        other_name: "Musa",
        email: "ahmed.bello@kidashi.com",
        phone: "+234 801 234 5678",
        role: "admin",
        status: "active",
        department: "Operations",
        created_at: "2024-01-15",
        last_login: "2024-01-20",
    },
    {
        id: "2",
        first_name: "Fatima",
        surname: "Yusuf",
        email: "fatima.yusuf@kidashi.com",
        phone: "+234 802 345 6789",
        role: "manager",
        status: "active",
        department: "Vendor Relations",
        created_at: "2024-02-10",
        last_login: "2024-01-19",
    },
    {
        id: "3",
        first_name: "Ibrahim",
        surname: "Abubakar",
        other_name: "Sani",
        email: "ibrahim.abubakar@kidashi.com",
        phone: "+234 803 456 7890",
        role: "staff",
        status: "active",
        department: "Customer Support",
        created_at: "2024-03-05",
        last_login: "2024-01-18",
    },
    {
        id: "4",
        first_name: "Aisha",
        surname: "Mohammed",
        email: "aisha.mohammed@kidashi.com",
        phone: "+234 804 567 8901",
        role: "staff",
        status: "inactive",
        department: "Finance",
        created_at: "2024-01-20",
        last_login: "2024-01-10",
    },
    {
        id: "5",
        first_name: "Usman",
        surname: "Aliyu",
        email: "usman.aliyu@kidashi.com",
        phone: "+234 805 678 9012",
        role: "manager",
        status: "active",
        department: "Trust Circle Management",
        created_at: "2024-02-15",
        last_login: "2024-01-20",
    },
]

const staffStats = {
    totalStaff: 15,
    activeStaff: 12,
    inactiveStaff: 2,
    admins: 3,
}

export default function StaffManagement() {
    console.log("[v0] Rendering Staff Management Page");

    const [filter, setFilter] = useState("all")
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
    const [newStaff, setNewStaff] = useState({
        first_name: "",
        surname: "",
        other_name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
    })

    const filteredStaff = mockStaffData.filter((staff) => {
        if (filter === "all") return true
        return staff.status === filter
    })

    const handleAddStaff = () => {
        console.log("Adding staff:", newStaff)
        setIsAddStaffOpen(false)
        setNewStaff({
            first_name: "",
            surname: "",
            other_name: "",
            email: "",
            phone: "",
            role: "",
            department: "",
        })
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage staff members, roles, permissions, and monitor activity across the platform.
                    </p>
                </div>
                <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Create a new staff account with role and department assignment
                            </DialogDescription>
                        </DialogHeader>
                        <AddStaffForm
                            staff={newStaff}
                            setStaff={setNewStaff}
                            onSubmit={handleAddStaff}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{staffStats.totalStaff}</div>
                        <p className="text-xs text-muted-foreground">All staff members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{staffStats.activeStaff}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Staff</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{staffStats.inactiveStaff}</div>
                        <p className="text-xs text-muted-foreground">Inactive accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{staffStats.admins}</div>
                        <p className="text-xs text-muted-foreground">Admin privileges</p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Table */}
            <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger
                        className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1"
                        value="all"
                    >
                        All Staff
                    </TabsTrigger>
                    <TabsTrigger
                        className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1"
                        value="active"
                    >
                        Active
                    </TabsTrigger>
                    <TabsTrigger
                        className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1"
                        value="inactive"
                    >
                        Inactive
                    </TabsTrigger>
                    <TabsTrigger
                        className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1"
                        value="suspended"
                    >
                        Suspended
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filter}>
                    <DataTable
                        columns={staffColumns}
                        data={filteredStaff}
                        searchColumn="full_name"
                        searchPlaceholder="Search staff by name..."
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function AddStaffForm({
    staff,
    setStaff,
    onSubmit,
}: {
    staff: any
    setStaff: (staff: any) => void
    onSubmit: () => void
}) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        placeholder="Enter first name"
                        value={staff.first_name}
                        onChange={(e) => setStaff({ ...staff, first_name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                        id="surname"
                        placeholder="Enter surname"
                        value={staff.surname}
                        onChange={(e) => setStaff({ ...staff, surname: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="other_name">Other Name (Optional)</Label>
                <Input
                    id="other_name"
                    placeholder="Enter other name"
                    value={staff.other_name}
                    onChange={(e) => setStaff({ ...staff, other_name: e.target.value })}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="staff@kidashi.com"
                        value={staff.email}
                        onChange={(e) => setStaff({ ...staff, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        placeholder="+234 800 000 0000"
                        value={staff.phone}
                        onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={staff.role} onValueChange={(value) => setStaff({ ...staff, role: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                        value={staff.department}
                        onValueChange={(value) => setStaff({ ...staff, department: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="vendor_relations">Vendor Relations</SelectItem>
                            <SelectItem value="trust_circle_management">Trust Circle Management</SelectItem>
                            <SelectItem value="customer_support">Customer Support</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="it">IT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button onClick={onSubmit} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff Member
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" type="button">
                    Cancel
                </Button>
            </div>
        </div>
    )
}
