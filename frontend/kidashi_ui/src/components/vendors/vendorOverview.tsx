import { CheckCircle, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"
import { formatMembershipDuration, formatStatusLabel, getStatusBadgeClass } from "@/lib/utils"


interface VendorOverviewProps {
    vendor: any
    onApprove: () => void
    onReject: () => void
    isUpdating?: boolean
}

export default function VendorOverview({
    vendor,
    onApprove,
    onReject,
    isUpdating,
}: VendorOverviewProps) {
    const vendorName = [vendor.first_name, vendor.other_name, vendor.surname].filter(Boolean).join(" ")
    const initials =
        vendorName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "VN"

    const profileImage = vendor.profileImage || vendor.profile_image || ""
    const statusLabel = formatStatusLabel(vendor.status)
    const canApprove = vendor.status?.toUpperCase() !== "ACTIVE"
    const canReject = vendor.status?.toUpperCase() !== "REJECTED"

    const statData: StatProps[] = [
        {
            name: "Trust Circles",
            value: vendor.active_trust_circles_count ?? 0,
            icon: "Users",
            description: "Active trust circles",
        },
        {
            name: "Women Members",
            value: vendor.total_women_onboarded ?? 0,
            icon: "UserCheck",
            description: "Women onboarded under vendor",
        },
        {
            name: "Repayment Rate",
            value: vendor.repayment_rate ? `${vendor.repayment_rate}%` : "N/A",
            icon: "TrendingUp",
            description: "Repayment success rate",
        },
        {
            name: "Membership",
            value: formatMembershipDuration(vendor.created_at),
            icon: "Calendar",
            description: vendor.created_at
                ? `Joined ${new Date(vendor.created_at).toLocaleDateString()}`
                : "Join date unavailable",
        },
    ]

    return (
        <Card className="rounded-xl overflow-hidden border shadow-sm">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                        <AvatarImage src={profileImage} alt={vendorName || "Vendor"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{vendor.business_name || vendorName || "Vendor"}</h1>
                        <p className="text-sm text-muted-foreground">{vendor.business_type}</p>
                        <Badge className={`mt-2 ${getStatusBadgeClass(vendor.status)}`}>{statusLabel}</Badge>
                    </div>
                </div>

                {(canApprove || canReject) && (
                    <div className="flex flex-wrap gap-2">
                        {canApprove && (
                            <Button
                                onClick={onApprove}
                                disabled={isUpdating}
                                className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="h-4 w-4" />
                                {isUpdating ? "Processing..." : "Approve"}
                            </Button>
                        )}
                        {canReject && (
                            <Button
                                onClick={onReject}
                                disabled={isUpdating}
                                variant="destructive"
                                className="gap-1"
                            >
                                <XCircle className="h-4 w-4" />
                                {isUpdating ? "Processing..." : "Reject"}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t">
                {statData.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>
        </Card>
    )
}
