import { useState } from "react"
import {
    Users, Phone, Mail, MapPin, Shield, Calendar,
    UserCheck, UserX, TrendingUp, FileText, ArrowRight, CheckCircle, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatCard from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { documentColumns, trustCircleColumns, womenColumns } from "@/components/vendors/vendorColumn"

const mockVendor = {
    id: "VEN-002",
    first_name: "Amina",
    surname: "Hassan",
    other_name: "Fatima",
    phone: "+2348034567890",
    email: "amina.hassan@email.com",
    business_name: "Amina's Textiles",
    business_type: "Retail Trading",
    business_description: "Retailer of textiles and household goods in Kano market.",
    address: "No. 12 Kano Central Market",
    community: "Kano Central",
    items_sold: ["Textiles", "Household Items", "Accessories"],
    status: "pending" as const,
    cba_customer_id: "8f14e45f-ea12-4b57-b22e-91a1a3e55936",
    geo_region: "North West",
    state: "Kano State",
    lga: "Kano Municipal",
    country: "Nigeria",
    ownerName: "Amina Hassan",
    profileImage: "/professional-woman-vendor.jpg",
    submittedAt: "2024-11-20T10:30:00Z",
    repaymentRate: 96.8,
    trustCircles: [
        { id: "TC-001", name: "Kano Market Women", memberCount: 15, totalLoanAmount: 750000, repaymentRate: 98.5, status: "active" as const },
        { id: "TC-002", name: "Textile Traders Circle", memberCount: 20, totalLoanAmount: 1200000, repaymentRate: 95.2, status: "active" as const },
        { id: "TC-003", name: "Small Business Network", memberCount: 10, totalLoanAmount: 500000, repaymentRate: 100, status: "completed" as const },
    ],
    womenMembers: [
        { id: "W-001", name: "Hauwa Abdullahi", phone: "+234 806 789 0123", loanAmount: 50000, repaymentStatus: "current" as const, joinDate: "2024-10-15" },
        { id: "W-002", name: "Zainab Mohammed", phone: "+234 807 890 1234", loanAmount: 75000, repaymentStatus: "current" as const, joinDate: "2024-09-20" },
        { id: "W-003", name: "Aisha Ibrahim", phone: "+234 808 901 2345", loanAmount: 30000, repaymentStatus: "overdue" as const, joinDate: "2024-08-10" },
    ],
    guarantors: [
        { name: "Ibrahim Hassan", relationship: "Brother", phone: "+234 804 567 8901" },
        { name: "Fatima Usman", relationship: "Business Partner", phone: "+234 805 678 9012" },
    ],
}

export default function VendorDetailPage() {
    const [vendor] = useState(mockVendor)
    const [activeTab, setActiveTab] = useState("overview")
    const [isProcessing, setIsProcessing] = useState(false)

    const statData = [
        { name: "Trust Circles", value: vendor.trustCircles.length, icon: "Users", description: "Total circles created by vendor" },
        { name: "Women Members", value: vendor.womenMembers.length, icon: "UserCheck", description: "Women onboarded under vendor" },
        { name: "Repayment Rate", value: `${vendor.repaymentRate}%`, icon: "TrendingUp", description: "Overall repayment success" },
        { name: "Membership", value: "11 months", icon: "Calendar", description: `Joined ${new Date(vendor.submittedAt).toLocaleDateString()}` },
    ]

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            suspended: "bg-gray-100 text-gray-800",
        }
        return variants[status as keyof typeof variants] || variants.pending
    }

    const handleApprove = async () => {
        setIsProcessing(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsProcessing(false)
    }

    const handleReject = async () => {
        setIsProcessing(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsProcessing(false)
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-6">
            <div className="space-y-6">

                {/* Header Section */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                                    <AvatarImage src={vendor.profileImage} alt={vendor.business_name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                        {vendor.business_name.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{vendor.business_name}</h1>
                                    <p className="text-sm text-muted-foreground">{vendor.business_type}</p>
                                    <Badge className={`mt-2 ${getStatusBadge(vendor.status)}`}>
                                        {vendor.status}
                                    </Badge>
                                </div>
                            </div>
                            {vendor.status === "pending" && (
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={handleApprove} disabled={isProcessing} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                                        <CheckCircle className="h-4 w-4" />
                                        {isProcessing ? "Processing..." : "Approve"}
                                    </Button>
                                    <Button onClick={handleReject} disabled={isProcessing} variant="destructive" className="gap-1">
                                        <XCircle className="h-4 w-4" />
                                        {isProcessing ? "Processing..." : "Reject"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t">
                        {statData.map((stat, index) => (
                            <StatCard key={index} name={stat.name} value={stat.value as string} icon={stat.icon} description={stat.description} />
                        ))}
                    </div>
                </div>

                {/* Tabs Section */}
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

                    {/* Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Personal & Contact Info */}
                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-primary" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Full Name:</strong> {`${vendor.first_name} ${vendor.surname ?? ""} ${vendor.surname}`}</p>
                                    <p><strong>Phone:</strong> {vendor.phone}</p>
                                    <p><strong>Email:</strong> {vendor.email || "N/A"}</p>
                                </CardContent>
                            </Card>
                            {/* Business & location Info */}
                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" /> Business & Location Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Business Name:</strong> {vendor.business_name}</p>
                                    <p><strong>Business Type:</strong> {vendor.business_type}</p>
                                    <p><strong>Business Description:</strong> {vendor.business_description}</p>
                                    <p><strong>Items Sold:</strong>
                                        {vendor.items_sold?.length
                                            ? vendor.items_sold.map((item: string, i: number) => (
                                                <Badge key={i} variant="outline" className="ml-2">{item}</Badge>
                                            ))
                                            : "N/A"}
                                    </p>
                                    <p><strong>Address:</strong> {vendor.address}</p>
                                    <p><strong>Community:</strong> {vendor.community || "N/A"}</p>
                                    <p><strong>Region:</strong> {vendor.geo_region || "N/A"}</p>
                                    <p><strong>State:</strong> {vendor.state || "N/A"}</p>
                                    <p><strong>LGA:</strong> {vendor.lga || "N/A"}</p>
                                    <p><strong>Country:</strong> {vendor.country || "N/A"}</p>
                                </CardContent>
                            </Card>

                            {/* Guarantors */}
                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" /> Guarantors ({vendor.guarantors.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {vendor.guarantors.map((g, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="font-medium">{g.name}</p>
                                                <p className="text-sm text-muted-foreground">{g.relationship}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">{g.phone}</p>
                                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Verified</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Trust Circles */}
                    <TabsContent value="trust-circles">
                        <DataTable columns={trustCircleColumns} data={vendor.trustCircles} searchColumn="name" searchPlaceholder="Search circles..." />
                    </TabsContent>

                    {/* Women Members */}
                    <TabsContent value="women-members">
                        <DataTable columns={womenColumns} data={vendor.womenMembers} searchColumn="name" searchPlaceholder="Search women..." />
                    </TabsContent>

                    {/* Documents */}
                    <TabsContent value="documents">
                        <DataTable
                            columns={documentColumns}
                            data={[
                                { id: 1, name: "BVN Document", type: "Bank Verification Number", status: "verified" },
                                { id: 2, name: "NIN Document", type: "National Identity Number", status: "verified" },
                                { id: 3, name: "Business License", type: "CAC Registration", status: "verified" },
                                { id: 4, name: "Guarantor Forms", type: "Completed Forms", status: "complete" },
                            ]}
                            searchColumn="name"
                            searchPlaceholder="Search documents..."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
