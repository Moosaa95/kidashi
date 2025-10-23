import { useParams } from "react-router"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    CreditCard,
    Users,
    TrendingUp,
    Loader2,
} from "lucide-react"
import { useGetTrustCircleDetailQuery } from "@/states/api/endpoints/trustcircles/trustcirlcesApiSlice"
import type { TrustCircles } from "@/types/global"



export default function TrustCircleDetail() {
    const { id } = useParams<{ id: string }>()

    const { data: circleData, isLoading, error } = useGetTrustCircleDetailQuery({ id, include_summary: true }, {
        skip: !id
    })

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Loading trust circle details...</span>
                </div>
            </div>
        )
    }

    if (error || !circleData?.status || !circleData?.data) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Unable to load trust circle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {circleData?.message || "Trust circle not found or an error occurred."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const circle = circleData.data as TrustCircles

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{circle.circle_name}</h1>
                    <p className="text-sm text-muted-foreground">{circle.location} • Vendor: {circle.vendor__first_name} {circle.vendor__surname}</p>
                </div>
                <Badge variant={circle.status === "active" ? "default" : "secondary"}>
                    {circle.status}
                </Badge>
            </div>

            {/* Circle Health Details */}
            <TrustCircleHealthDetails circle={circle} />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <Button className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                </Button>
                <Button variant="outline" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Loan History
                </Button>
                <Button variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance Report
                </Button>
            </div>
        </div>
    )
}

/* Reuse the details component but rename it for clarity */
function TrustCircleHealthDetails({ circle }: { circle: any }) {
    const activeMembers = circle.summary.active_members || 0
    const totalMembers = circle.summary.total_circle_members || 0
    const activePercentage = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0

    return (
        <div className="space-y-6">
            {/* Overview cards (activity + loan performance + loan status) */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Example: Active vs Inactive */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Member Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Active Members</span>
                                <span className="font-medium">{activeMembers}</span>
                            </div>
                            <Progress value={activePercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                {/* <span>Inactive: {totalMembers - activeMembers}</span> */}
                                <span>{activePercentage}% active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Circle Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Circle Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Total Members</span>
                                <span className="font-medium">{totalMembers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Max Members</span>
                                <span className="font-medium">{circle.max_members || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Loan Eligibility</span>
                                <span className={`font-medium ${circle.loan_eligibility === "ELIGIBLE" ? "text-green-600" : "text-red-600"}`}>
                                    {circle.loan_eligibility}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Asset Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Total Asset Amount</span>
                                <span className="font-medium">₦{(circle.summary.total_asset_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Created</span>
                                <span>{new Date(circle.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
