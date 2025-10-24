import { useParams, Link } from "react-router"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Package,
    User,
    Store,
    TrendingUp,
    Loader2,
    ArrowLeft,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { useGetAssetDetailMutation } from "@/states/api/endpoints/assets/assetsApiSlice"
import type { Asset } from "@/types/global"

export default function AssetDetail() {
    const { id } = useParams<{ id: string }>()
    const [asset, setAsset] = useState<Asset | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [getAssetDetail, { isLoading, error }] = useGetAssetDetailMutation()

    useEffect(() => {
        if (id) {
            getAssetDetail({ asset_id: id })
                .unwrap()
                .then((response) => {
                    if (response.status && response.data) {
                        setAsset(response.data.asset)
                        setMetrics(response.data.metrics || null)
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch asset detail:", err)
                })
        }
    }, [id, getAssetDetail])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Loading asset details...</span>
                </div>
            </div>
        )
    }

    if (error || !asset) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Unable to load asset</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Asset not found or an error occurred while fetching details.
                        </p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link to="/assets/list">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Assets
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusColorMap: Record<string, string> = {
        REQUESTED: "bg-yellow-100 text-yellow-800",
        QUERIED: "bg-blue-100 text-blue-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        FAILED: "bg-red-100 text-red-800",
        CLOSED: "bg-gray-100 text-gray-800",
        RUNNING: "bg-green-100 text-green-800",
    }

    const repaymentProgress = metrics?.repayment_progress ?? 0

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link to="/assets/list">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Asset Details</h1>
                        <p className="text-sm text-muted-foreground">
                            Request ID: {asset.id}
                        </p>
                    </div>
                </div>
                <Badge className={statusColorMap[asset.status] || "bg-gray-100 text-gray-800"}>
                    {asset.status}
                </Badge>
            </div>

            {/* Asset Information */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Asset Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Asset Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Asset Name</span>
                            <span className="text-sm font-medium">{asset.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Product Code</span>
                            <span className="text-sm font-medium">{asset.product_code || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Asset Value</span>
                            <span className="text-sm font-medium">₦{asset.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Markup</span>
                            <span className="text-sm font-medium">₦{asset.markup.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-sm font-medium">
                                ₦{(asset.value + asset.markup).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Request Date</span>
                            <span className="text-sm font-medium">
                                {new Date(asset.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {/* {asset.reject_reason && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Rejection Reason</span>
                                <span className="text-sm font-medium">{asset.reject_reason}</span>
                            </div>
                        )} */}
                    </CardContent>
                </Card>

                {/* Woman Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Beneficiary Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="text-sm font-medium">
                                {asset.woman__first_name} {asset.woman__surname}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Trust Circle</span>
                            <span className="text-sm font-medium">
                                {asset.woman__trust_circle__circle_name || "N/A"}
                            </span>
                        </div>
                        {asset.woman_id && (
                            <div className="pt-2">
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to={`/women/${asset.woman_id}`}>
                                        View Woman Profile
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Repayment Metrics (if available) */}
            {metrics && (asset.status === "RUNNING" || asset.status === "CLOSED") && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Repayment Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Repayment Progress</span>
                                    <span className="font-medium">{repaymentProgress.toFixed(1)}%</span>
                                </div>
                                <Progress value={repaymentProgress} className="h-3" />
                            </div>

                            {/* Repayment Details Grid */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Disbursement Date</p>
                                    <p className="text-sm font-medium">
                                        {metrics.disbursement_date
                                            ? new Date(metrics.disbursement_date).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Maturity Date</p>
                                    <p className="text-sm font-medium">
                                        {metrics.maturity_date
                                            ? new Date(metrics.maturity_date).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Amount Repaid</p>
                                    <p className="text-sm font-medium text-green-600">
                                        ₦{(metrics.amount_repaid ?? 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Amount Unpaid</p>
                                    <p className="text-sm font-medium text-red-600">
                                        ₦{(metrics.amount_unpaid ?? 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Principal Balance */}
                            {metrics.principal_balance_left !== undefined && (
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Principal Balance Left</span>
                                        <span className="text-lg font-bold">
                                            ₦{metrics.principal_balance_left.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Vendor Information */}
            {asset.vendor__id && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            Vendor Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium">
                                    {asset.vendor__first_name} {asset.vendor__surname}
                                </p>
                                <p className="text-xs text-muted-foreground">Business Type: {asset.vendor__business_type}</p>
                                <p className="text-xs text-muted-foreground">Business Description: {asset.vendor__business_description}</p>
                                <p className="text-xs text-muted-foreground">Vendor Phone: {asset.vendor__phone}</p>
                                <p className="text-xs text-muted-foreground">
                                    Community: {asset.vendor__community || "N/A"}
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to={`/vendors/${asset.vendor__id}`}>
                                    View Vendor Profile
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rejection Reason (if applicable) */}
            {(asset.status === "REJECTED" || asset.status === "FAILED") && asset.reject_reason && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-5 w-5" />
                            Rejection Reason
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-700">{asset.reject_reason}</p>
                    </CardContent>
                </Card>
            )}

            {/* Items Requested (if available) */}
            {asset.items_requested && asset.items_requested.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Items Requested
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {asset.items_requested.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                    <span className="text-sm">{item.name || item.description || `Item ${index + 1}`}</span>
                                    {item.price && (
                                        <span className="text-xs text-muted-foreground">Price: N{item.price}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <Button asChild variant="outline" className="flex-1">
                    <Link to="/assets/list">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Assets
                    </Link>
                </Button>
                {asset.status === "REQUESTED" && (
                    <>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Asset
                        </Button>
                        <Button variant="destructive" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Asset
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
