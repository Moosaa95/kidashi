import { useParams } from "react-router"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Phone,
    UserCheck,
    UserX,
    CreditCard,
    CheckCircle,
    AlertTriangle,
    Clock,
    Users,
    TrendingUp,
} from "lucide-react"
import { useAppSelector } from "@/states/app/hooks"



export default function TrustCircleDetail() {
    const { circles } = useAppSelector(state => state.circles)
    const { id } = useParams()
    const circle = circles.find((c) => c.id === id)

    if (!circle) {
        return <p className="p-6 text-muted-foreground">Trust Circle not found</p>
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{circle.name}</h1>
                    <p className="text-sm text-muted-foreground">{circle.location} • Vendor: {circle.vendorName}</p>
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
                                <span className="font-medium">{circle.activeWomen}</span>
                            </div>
                            <Progress value={(circle.activeWomen / circle.womenCount) * 100} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Inactive: {circle.inactiveWomen}</span>
                                <span>{Math.round((circle.activeWomen / circle.womenCount) * 100)}% active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loan performance */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Loan Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Repayment Rate</span>
                                <span className="font-medium">{circle.repaymentRate}%</span>
                            </div>
                            <Progress value={circle.repaymentRate} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Defaulted: {circle.defaultLoan}</span>
                                <span>Repaid: {circle.repaidLoan}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loan counts */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Loan Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Active Loans</span>
                                <span className="font-medium">{circle.activeLoan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Repaid Loans</span>
                                <span className="font-medium">{circle.repaidLoan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Defaulted</span>
                                <span className="font-medium text-destructive">{circle.defaultLoan}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
