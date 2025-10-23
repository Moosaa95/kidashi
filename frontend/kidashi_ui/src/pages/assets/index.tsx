import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/datatable"
import { assetColumns } from "@/components/assets/assetColumn"
import { useFetchAssetsQuery } from "@/states/api/endpoints/assets/assetsApiSlice"
import type { Asset } from "@/types/global"
import { Package, Clock, TrendingUp, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type AssetStatusFilter = "all" | "REQUESTED" | "APPROVED" | "RUNNING" | "CLOSED" | "REJECTED" | "FAILED"

export default function AssetManagement() {
    const [statusFilter, setStatusFilter] = useState<AssetStatusFilter>("all")

    const { data: assetsData, isLoading, error } = useFetchAssetsQuery({ include_summary: true })

    // Extract assets and metrics from response
    const assets = useMemo(() => {
        if (!assetsData?.data) return []
        return assetsData.data
    }, [assetsData])

    const metrics = useMemo(() => {
        return assetsData?.summary ?? null
    }, [assetsData])

    // Calculate stats with fallback to client-side calculation
    const totalAssets = metrics?.total_assets ?? assets.length
    const totalPending = metrics?.total_pending_assets ?? assets.filter((a: Asset) => a.status === "REQUESTED" || a.status === "QUERIED").length
    const totalOngoing = metrics?.total_ongoing_assets ?? assets.filter((a: Asset) => a.status === "APPROVED" || a.status === "RUNNING").length
    const totalCompleted = metrics?.total_completed_assets ?? assets.filter((a: Asset) => a.status === "CLOSED").length
    const totalFailed = metrics?.total_failed_assets ?? assets.filter((a: Asset) => a.status === "REJECTED" || a.status === "FAILED").length
    const totalAssetValue = metrics?.total_asset_value ?? assets.reduce((sum: number, a: Asset) => sum + a.value, 0)
    const totalOngoingValue = metrics?.total_ongoing_value ?? assets.filter((a: Asset) => a.status === "APPROVED" || a.status === "RUNNING").reduce((sum: number, a: Asset) => sum + a.value, 0)

    // Filter assets based on selected status
    const filteredAssets = useMemo(() => {
        if (statusFilter === "all") return assets

        if (statusFilter === "REQUESTED") {
            return assets.filter((asset: Asset) => asset.status === "REQUESTED" || asset.status === "QUERIED")
        }
        if (statusFilter === "RUNNING") {
            return assets.filter((asset: Asset) => asset.status === "APPROVED" || asset.status === "RUNNING")
        }

        return assets.filter((asset: Asset) => asset.status === statusFilter)
    }, [assets, statusFilter])

    if (error) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Unable to load assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            An error occurred while fetching asset data. Please try again later.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Asset Management</h1>
                <p className="text-sm text-muted-foreground">
                    Track and manage all asset requests and loans
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Assets */}
                {isLoading ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalAssets}</div>
                            <p className="text-xs text-muted-foreground">
                                ₦{totalAssetValue.toLocaleString()} total value
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Assets */}
                {isLoading ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPending}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Ongoing Assets */}
                {isLoading ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalOngoing}</div>
                            <p className="text-xs text-muted-foreground">
                                ₦{totalOngoingValue.toLocaleString()} in circulation
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Completed Assets */}
                {isLoading ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCompleted}</div>
                            <p className="text-xs text-muted-foreground">
                                {totalFailed} rejected/failed
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Tabs and Table */}
            <Card>
                <CardHeader>
                    <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as AssetStatusFilter)}>
                        <TabsList className=" bg-card p-1 h-auto rounded-lg border shadow-sm">
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All Assets</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="REQUESTED">Pending</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="RUNNING">Active</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="CLOSED">Completed</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="REJECTED">Rejected</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            columns={assetColumns}
                            data={filteredAssets}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
