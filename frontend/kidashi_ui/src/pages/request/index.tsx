import type { StatProps } from "@/components/dashboard/StatCard"
import StatCard from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { vendorColumns } from "@/components/vendors/vendorColumn"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { setFilter } from "@/states/features/dashboard/vendorSlice"
import { useState } from "react"

export default function VendorRequest() {
    const [searchQuery, setSearchQuery] = useState("")
    const dispatch = useAppDispatch()
    const { requests, vendors, loading, filter } = useAppSelector(state => state.vendors)

    const statsData: StatProps[] = [
        {
            name: "Total Vendor Requests",
            value: requests.total_requests.toString(),
            change: "",
            changeType: "positive" as const,
            icon: "Clock",
            description: "total requests"
        },
        {
            name: "Pending Requests",
            value: requests?.pending_requests.toString(),
            change: "",
            changeType: "positive" as const,
            icon: "CheckCircle",
            description: "Awaiting Review"
        },
        {
            name: "Approved Requests",
            value: requests.approved_requests.toString(),
            change: "-1.2%",
            changeType: "negative" as const,
            icon: "Building2",
        },
    ]

    const filtered = vendors.filter((vendor) => {
        const matchesSearch =
            vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || vendor.status === filter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Request</h1>
                    <p className="text-muted-foreground mt-2">
                        Vendor application requests.
                    </p>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                {statsData.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>

            <Tabs className="space-y-6" value={filter} defaultValue="all" onValueChange={(val) => dispatch(setFilter(val as any))}>
                <TabsList className="grid w-full grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="pending">Pending</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="approved">Approved</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value={filter}>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading vendors...</p>
                    ) : (
                        <DataTable columns={vendorColumns} data={filtered} searchColumn="name" searchPlaceholder="search vendors" />
                    )}
                </TabsContent>
            </Tabs>

        </div>
    )
}
