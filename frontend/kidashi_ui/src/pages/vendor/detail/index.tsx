import { useEffect, useState } from "react"
import { useParams } from "react-router"
import {
    CheckCircle,
    FileText,
    Loader2,
    Shield,
    UserCheck,
    Users,
    XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { documentColumns, trustCircleColumns, womenColumns } from "@/components/vendors/vendorColumn"
import type { VendorDetail, VendorStatus } from "@/types/global"
import {
    useGetVendorDetailMutation,
    useUpdateVendorApplicationStatusMutation,
} from "@/states/api/endpoints/vendors/vendorApiSlice"
import { toast } from "sonner"

interface ActionFeedback {
    type: "success" | "error"
    message: string
}

const statusVariants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
    inactive: "bg-gray-100 text-gray-800",
}

const defaultDocuments = [
    { id: 1, name: "BVN Document", type: "Bank Verification Number", status: "verified" },
    { id: 2, name: "NIN Document", type: "National Identity Number", status: "verified" },
    { id: 3, name: "Business License", type: "CAC Registration", status: "verified" },
    { id: 4, name: "Guarantor Forms", type: "Completed Forms", status: "complete" },
]

const getStatusBadgeClass = (status?: string) => {
    if (!status) return "bg-muted text-muted-foreground"
    return statusVariants[status.toLowerCase()] ?? "bg-muted text-muted-foreground"
}

const formatStatusLabel = (status?: string) => {
    if (!status) return "Unknown"
    return status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(^|\s)\w/g, (char) => char.toUpperCase())
}

const formatMembershipDuration = (createdAt?: string) => {
    if (!createdAt) return "N/A"
    const createdDate = new Date(createdAt)
    if (Number.isNaN(createdDate.getTime())) return "N/A"

    const now = new Date()
    const diffInMs = now.getTime() - createdDate.getTime()
    const diffInDays = Math.max(1, Math.floor(diffInMs / (1000 * 60 * 60 * 24)))

    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"}`
    }

    const years = Math.floor(diffInMonths / 12)
    const remainingMonths = diffInMonths % 12

    if (remainingMonths === 0) {
        return `${years} year${years === 1 ? "" : "s"}`
    }

    return `${years} yr${years > 1 ? "s" : ""} ${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null) {
        const maybeError = error as { data?: unknown; error?: string; message?: string }
        if (maybeError.data && typeof maybeError.data === "object") {
            const data = maybeError.data as Record<string, unknown>
            if (typeof data.message === "string") {
                return data.message
            }
            if (typeof data.detail === "string") {
                return data.detail
            }
        }
        if (typeof maybeError.message === "string") {
            return maybeError.message
        }
        if (typeof maybeError.error === "string") {
            return maybeError.error
        }
    }
    return fallback
}

const buildStatData = (
    vendor: VendorDetail,
    trustCirclesCount: number,
    womenMembersCount: number,
): StatProps[] => {
    const repaymentRate = vendor.repayment_rate ?? vendor.repaymentRate
    return [
        {
            name: "Trust Circles",
            value: `${trustCirclesCount || vendor.active_trust_circles_count || 0}`,
            icon: "Users",
            description: "Active trust circles",
        },
        {
            name: "Women Members",
            value: `${womenMembersCount || vendor.total_women_onboarded || 0}`,
            icon: "UserCheck",
            description: "Women onboarded under vendor",
        },
        {
            name: "Repayment Rate",
            value: repaymentRate != null ? `${repaymentRate}%` : "N/A",
            icon: "TrendingUp",
            description: "Overall repayment success",
        },
        {
            name: "Membership",
            value: formatMembershipDuration(vendor.created_at),
            icon: "Calendar",
            description: vendor.created_at ? `Joined ${new Date(vendor.created_at).toLocaleDateString()}` : "Join date unavailable",
        },
    ]
}

export default function VendorDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState("overview")
    const [vendor, setVendor] = useState<VendorDetail | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null)
    const [isFetchingVendor, setIsFetchingVendor] = useState(false)

    const [getVendorDetail] = useGetVendorDetailMutation()
    const [updateVendorStatus, { isLoading: isUpdatingStatus }] = useUpdateVendorApplicationStatusMutation()


    useEffect(() => {
        if (!id) {
            setErrorMessage("Vendor id is required")
            return
        }

        let isMounted = true
        setIsFetchingVendor(true)
        setErrorMessage(null)
        setActionFeedback(null)

            ; (async () => {
                try {
                    const response = await getVendorDetail({ vendor_id: id }).unwrap()
                    if (!isMounted) return

                    if (!response.status || !response.data) {
                        setVendor(null)
                        setErrorMessage(response.message || "Vendor not found")
                        return
                    }

                    setVendor(response.data)
                } catch (error) {
                    if (!isMounted) return
                    setVendor(null)
                    setErrorMessage(getErrorMessage(error, "Unable to fetch vendor details"))
                } finally {
                    if (isMounted) {
                        setIsFetchingVendor(false)
                    }
                }
            })()

        return () => {
            isMounted = false
        }
    }, [id, getVendorDetail])

    // const handleStatusChange = async (nextStatus: VendorStatus | string) => {
    //     if (!vendor) return

    //     setActionFeedback(null)
    //     try {
    //         const response = await updateVendorStatus({ vendor_id: vendor.id, status: nextStatus }).unwrap()
    //         console.log("============RESPONSE");
    //         console.log(response);


    //         if (!response.status) {
    //             setActionFeedback({ type: "error", message: response.message || "Unable to update vendor status" })
    //             return
    //         }

    //         setVendor(prev => (prev ? { ...prev, status: nextStatus } : prev))
    //         setActionFeedback({ type: "success", message: response.message || "Vendor status updated successfully" })
    //     } catch (error) {
    //         setActionFeedback({ type: "error", message: getErrorMessage(error, "Unable to update vendor status") })
    //     }
    // }
    const handleStatusChange = async (nextStatus: VendorStatus | string) => {
        if (!vendor) return

        try {
            const response = await updateVendorStatus({
                vendor_id: vendor.id,
                status: nextStatus,
            }).unwrap()

            if (!response.status) {
                toast.error(response.message || "Unable to update vendor status")
                return
            }

            setVendor((prev) => (prev ? { ...prev, status: nextStatus } : prev))
            toast.success(response.message || "Vendor status updated successfully")
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to update vendor status"))
        }
    }

    const handleApprove = () => handleStatusChange("ACTIVE")
    const handleReject = () => handleStatusChange("REJECTED")
    const handleSuspend = () => handleStatusChange("SUSPENDED")

    if (isFetchingVendor) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Loading vendor details...</span>
                </div>
            </div>
        )
    }

    if (errorMessage && !vendor) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Unable to load vendor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Vendor not found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">We could not find the vendor you requested.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const vendorName = [vendor.first_name, vendor.other_name, vendor.surname].filter(Boolean).join(" ")
    const profileImage = vendor.profileImage || vendor.profile_image || ""
    const trustCircles = (vendor.trustCircles ?? vendor.trust_circles ?? []) as any[]
    const womenMembers = (vendor.womenMembers ?? vendor.women_members ?? []) as any[]
    const documents =
        vendor.documents && vendor.documents.length
            ? vendor.documents.map((doc, index) => {
                if (typeof doc === "string") {
                    return { id: index, name: doc, type: "Document", status: "uploaded" }
                }
                return doc
            })
            : defaultDocuments
    const statusLabel = formatStatusLabel(vendor.status)
    const status = vendor.status?.toUpperCase()

    const canApprove = ["PENDING", "REJECTED", "SUSPENDED"].includes(status)
    const canReject = ["PENDING"].includes(status)
    const canSuspend = status === "ACTIVE"
    // const canApprove = vendor.status ? vendor.status.toUpperCase() !== "ACTIVE" : true
    // const canReject = vendor.status ? vendor.status.toUpperCase() !== "REJECTED" : true
    const initialsSource = vendorName || vendor.business_name || "Vendor"
    const initials = initialsSource
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "VN"

    const statData = buildStatData(vendor, trustCircles.length, womenMembers.length)

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-6">
            <div className="space-y-6">
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                                    <AvatarImage src={profileImage} alt={vendorName || "Vendor"} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{vendor.business_name || vendorName || "Vendor"}</h1>
                                    <p className="text-sm text-muted-foreground">{vendor.business_type}</p>
                                    <Badge className={`mt-2 ${getStatusBadgeClass(vendor.status)}`}>{statusLabel}</Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-2">
                                    {canApprove && (
                                        <Button
                                            onClick={handleApprove}
                                            disabled={isUpdatingStatus}
                                            className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            {isUpdatingStatus ? "Processing..." : "Approve"}
                                        </Button>
                                    )}
                                    {canReject && (
                                        <Button
                                            onClick={handleReject}
                                            disabled={isUpdatingStatus}
                                            variant="destructive"
                                            className="gap-1"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            {isUpdatingStatus ? "Processing..." : "Reject"}
                                        </Button>
                                    )}
                                    {canSuspend && (
                                        <Button
                                            onClick={handleSuspend}
                                            disabled={isUpdatingStatus}
                                            variant="secondary"
                                            className="gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                                        >
                                            <Shield className="h-4 w-4" />
                                            {isUpdatingStatus ? "Processing..." : "Suspend"}
                                        </Button>
                                    )}
                                </div>
                                {actionFeedback && (
                                    <p
                                        className={`text-sm ${actionFeedback.type === "success"
                                            ? "text-green-600"
                                            : "text-destructive"
                                            }`}
                                    >
                                        {actionFeedback.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t">
                        {statData.map((stat) => (
                            <StatCard key={stat.name} {...stat} />
                        ))}
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full grid grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                        <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <Users className="h-4 w-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="trust-circles" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <Users className="h-4 w-4" /> Trust Circles
                        </TabsTrigger>
                        <TabsTrigger value="women-members" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <UserCheck className="h-4 w-4" /> Women Members
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <FileText className="h-4 w-4" /> Documents
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-primary" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Full Name:</strong> {vendorName || "N/A"}</p>
                                    <p><strong>Phone:</strong> {vendor.phone || "N/A"}</p>
                                    <p><strong>Email:</strong> {vendor.email || "N/A"}</p>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" /> Business &amp; Location Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Business Name:</strong> {vendor.business_name || "N/A"}</p>
                                    <p><strong>Business Type:</strong> {vendor.business_type || "N/A"}</p>
                                    <p><strong>Business Description:</strong> {vendor.business_description || "N/A"}</p>
                                    <p>
                                        <strong>Items Sold:</strong>{" "}
                                        {(vendor.items_sold ?? []).length
                                            ? (vendor.items_sold ?? []).map((item: string, index: number) => (
                                                <Badge key={index} variant="outline" className="ml-2">
                                                    {item}
                                                </Badge>
                                            ))
                                            : "N/A"}
                                    </p>
                                    <p><strong>Address:</strong> {vendor.address || "N/A"}</p>
                                    <p><strong>Community:</strong> {vendor.community || "N/A"}</p>
                                    <p><strong>Region:</strong> {vendor.geo_region || "N/A"}</p>
                                    <p><strong>State:</strong> {vendor.state || "N/A"}</p>
                                    <p><strong>LGA:</strong> {vendor.lga || "N/A"}</p>
                                    <p><strong>Country:</strong> {vendor.country || "N/A"}</p>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" /> Guarantors ({(vendor.guarantors ?? []).length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(vendor.guarantors ?? []).length ? (
                                        (vendor.guarantors ?? []).map((guarantor, index) => {
                                            const guarantorName = [
                                                guarantor.first_name,
                                                guarantor.other_name,
                                                guarantor.surname,
                                            ].filter(Boolean).join(" ")
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{guarantorName || "Guarantor"}</p>
                                                        <p className="text-sm text-muted-foreground">{guarantor.relationship || "Relationship not provided"}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm">{guarantor.phone || "N/A"}</p>
                                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                                            {(guarantor.verification_status || "Pending").toLowerCase() === "verified" ? "Verified" : guarantor.verification_status || "Pending"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No guarantors added yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trust-circles">
                        <DataTable
                            columns={trustCircleColumns}
                            data={trustCircles}
                            searchColumn="name"
                            searchPlaceholder="Search circles..."
                        />
                    </TabsContent>

                    <TabsContent value="women-members">
                        <DataTable
                            columns={womenColumns}
                            data={womenMembers}
                            searchColumn="name"
                            searchPlaceholder="Search women..."
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                        <DataTable
                            columns={documentColumns}
                            data={documents}
                            searchColumn="name"
                            searchPlaceholder="Search documents..."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
