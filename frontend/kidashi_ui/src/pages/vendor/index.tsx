import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/states/app/hooks";
import { updateVendorStatus, setFilter } from "@/states/features/dashboard/vendorSlice";
import StatCard, { type StatProps } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/datatable";
import { vendorColumns } from "@/components/vendors/vendorColumn";

export default function VendorManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedVendor, setSelectedVendor] = useState<any>(null)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [searchParams] = useSearchParams()

    const { vendors, loading, filter, stats } = useAppSelector((state) => state.vendors)

    const statsData: StatProps[] = [
        {
            name: "Pending Applications",
            value: stats.pendingApplications.toString(),
            change: "",
            changeType: "positive" as const,
            icon: "Clock",
            description: "Awaiting review"
        },
        {
            name: "Active Vendors",
            value: stats.activeVendors.toString(),
            change: "",
            changeType: "positive" as const,
            icon: "CheckCircle",
            description: "Currently operating"
        },
        {
            name: "Total Trust Circles",
            value: stats.totalTrustCircles.toString(),
            change: "-1.2%",
            changeType: "negative" as const,
            icon: "Building2",
        },
        {
            name: "Avg. Repayment Rate",
            value: `${stats.averageRepaymentRate}%`,
            change: "+0.8%",
            changeType: "positive" as const,
            icon: "TrendingUp",
        },
    ]

    const filtered = vendors.filter((vendor) => {
        const matchesSearch =
            vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || vendor.status === filter
        return matchesSearch && matchesFilter
    })

    useEffect(() => {
        const reviewId = searchParams.get("review")
        if (reviewId) {
            const vendor = vendors.find((v) => v.id === reviewId)
            if (vendor) {
                setSelectedVendor(vendor)
            }
        }
    }, [searchParams, vendors])


    const handleApproveVendor = (vendorId: string, vendorName: string) => {
        console.log("[v0] Approving vendor:", vendorName)
        dispatch(updateVendorStatus({ id: vendorId, status: "approved" }))
    }

    const handleRejectVendor = (vendorId: string, vendorName: string) => {
        console.log("[v0] Rejecting vendor:", vendorName)
        dispatch(updateVendorStatus({ id: vendorId, status: "rejected" }))
    }



    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Review vendor applications, manage approved vendors, and monitor performance metrics.
                    </p>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
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