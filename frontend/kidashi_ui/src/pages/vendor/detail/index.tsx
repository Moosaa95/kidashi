import { useState } from "react"
import { CheckCircle, XCircle, Users, Phone, Mail, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/datatable"
import { documentColumns, trustCircleColumns, womenColumns } from "@/components/vendors/vendorColumn"
import { VendorInfoItem } from "@/components/vendors/vendorInfoItem"
import { VendorMetricsCard } from "@/components/vendors/vendorMetricCard"

const mockVendor = {
    id: "VEN-002",
    name: "Amina Hassan",
    email: "amina.hassan@email.com",
    phone: "+234 803 456 7890",
    location: "Kano, Nigeria",
    status: "pending" as const,
    applicationDate: "2024-11-20",
    guarantorName: "Ibrahim Hassan",
    guarantorPhone: "+234 804 567 8901",
    trustCirclesCount: 3,
    totalWomen: 45,
    repaymentRate: 96.8,
    documents: ["id_card.pdf", "guarantor_form.pdf", "business_license.pdf"],
    profileImage: "/professional-woman-vendor.jpg",
    businessType: "Retail Trading",
    ownerName: "Amina Hassan",
    submittedAt: "2024-11-20T10:30:00Z",
    guarantors: [
        {
            name: "Ibrahim Hassan",
            relationship: "Brother",
            phone: "+234 804 567 8901",
        },
        {
            name: "Fatima Usman",
            relationship: "Business Partner",
            phone: "+234 805 678 9012",
        },
    ],
    trustCircles: [
        {
            id: "TC-001",
            name: "Kano Market Women",
            memberCount: 15,
            totalLoanAmount: 750000,
            repaymentRate: 98.5,
            status: "active" as const,
        },
        {
            id: "TC-002",
            name: "Textile Traders Circle",
            memberCount: 20,
            totalLoanAmount: 1200000,
            repaymentRate: 95.2,
            status: "active" as const,
        },
        {
            id: "TC-003",
            name: "Small Business Network",
            memberCount: 10,
            totalLoanAmount: 500000,
            repaymentRate: 100,
            status: "completed" as const,
        },
    ],
    womenMembers: [
        {
            id: "W-001",
            name: "Hauwa Abdullahi",
            phone: "+234 806 789 0123",
            loanAmount: 50000,
            repaymentStatus: "current" as const,
            joinDate: "2024-10-15",
        },
        {
            id: "W-002",
            name: "Zainab Mohammed",
            phone: "+234 807 890 1234",
            loanAmount: 75000,
            repaymentStatus: "current" as const,
            joinDate: "2024-09-20",
        },
        {
            id: "W-003",
            name: "Aisha Ibrahim",
            phone: "+234 808 901 2345",
            loanAmount: 30000,
            repaymentStatus: "overdue" as const,
            joinDate: "2024-08-10",
        },
        {
            id: "W-004",
            name: "Maryam Musa",
            phone: "+234 809 123 4567",
            loanAmount: 60000,
            repaymentStatus: "current" as const,
            joinDate: "2024-07-12",
        },
        {
            id: "W-005",
            name: "Fatima Aliyu",
            phone: "+234 810 234 5678",
            loanAmount: 45000,
            repaymentStatus: "completed" as const,
            joinDate: "2024-06-18",
        },
        {
            id: "W-006",
            name: "Khadija Suleiman",
            phone: "+234 811 345 6789",
            loanAmount: 80000,
            repaymentStatus: "overdue" as const,
            joinDate: "2024-05-25",
        },
        {
            id: "W-007",
            name: "Rahma Yusuf",
            phone: "+234 812 456 7890",
            loanAmount: 55000,
            repaymentStatus: "current" as const,
            joinDate: "2024-04-14",
        },
        {
            id: "W-008",
            name: "Jamila Danjuma",
            phone: "+234 813 567 8901",
            loanAmount: 70000,
            repaymentStatus: "completed" as const,
            joinDate: "2024-03-28",
        },
        {
            id: "W-009",
            name: "Hadiza Lawal",
            phone: "+234 814 678 9012",
            loanAmount: 40000,
            repaymentStatus: "current" as const,
            joinDate: "2024-02-10",
        },
        {
            id: "W-010",
            name: "Safiya Mohammed",
            phone: "+234 815 789 0123",
            loanAmount: 95000,
            repaymentStatus: "overdue" as const,
            joinDate: "2024-01-05",
        },
        {
            id: "W-011",
            name: "Asma'u Bello",
            phone: "+234 816 890 1234",
            loanAmount: 35000,
            repaymentStatus: "current" as const,
            joinDate: "2023-12-19",
        },
        {
            id: "W-012",
            name: "Amina Umar",
            phone: "+234 817 901 2345",
            loanAmount: 120000,
            repaymentStatus: "completed" as const,
            joinDate: "2023-11-30",
        },
        {
            id: "W-013",
            name: "Zahra Ibrahim",
            phone: "+234 818 012 3456",
            loanAmount: 67000,
            repaymentStatus: "overdue" as const,
            joinDate: "2023-10-15",
        },
        {
            id: "W-014",
            name: "Halima Abdullahi",
            phone: "+234 819 123 4567",
            loanAmount: 72000,
            repaymentStatus: "current" as const,
            joinDate: "2023-09-02",
        },
        {
            id: "W-015",
            name: "Rukaiya Usman",
            phone: "+234 820 234 5678",
            loanAmount: 50000,
            repaymentStatus: "completed" as const,
            joinDate: "2023-08-21",
        },
        {
            id: "W-016",
            name: "Sa'adatu Kabir",
            phone: "+234 821 345 6789",
            loanAmount: 88000,
            repaymentStatus: "current" as const,
            joinDate: "2023-07-09",
        },
        {
            id: "W-017",
            name: "Bilqis Haruna",
            phone: "+234 822 456 7890",
            loanAmount: 46000,
            repaymentStatus: "overdue" as const,
            joinDate: "2023-06-25",
        },
        {
            id: "W-018",
            name: "Na'ima Idris",
            phone: "+234 823 567 8901",
            loanAmount: 52000,
            repaymentStatus: "completed" as const,
            joinDate: "2023-05-11",
        },
        {
            id: "W-019",
            name: "Bilkisu Salisu",
            phone: "+234 824 678 9012",
            loanAmount: 81000,
            repaymentStatus: "current" as const,
            joinDate: "2023-04-03",
        },
        {
            id: "W-020",
            name: "Habiba Nuhu",
            phone: "+234 825 789 0123",
            loanAmount: 94000,
            repaymentStatus: "overdue" as const,
            joinDate: "2023-03-17",
        },
    ]

}

export default function VendorDetailPage() {
    //   const router = useRouter()
    const [vendor] = useState(mockVendor)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleApprove = async () => {
        setIsProcessing(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsProcessing(false)
        // In real app, update vendor status and redirect
        // router.push("/vendors")
    }

    const handleReject = async () => {
        setIsProcessing(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsProcessing(false)
        // In real app, update vendor status and redirect
        // router.push("/vendors")
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: "bg-warning text-warning-foreground",
            approved: "bg-success text-success-foreground",
            rejected: "bg-destructive text-destructive-foreground",
            suspended: "bg-muted text-muted-foreground",
        }
        return variants[status as keyof typeof variants] || variants.pending
    }

    // const getRepaymentStatusBadge = (status: string) => {
    //     const variants = {
    //         current: "bg-success text-success-foreground",
    //         overdue: "bg-destructive text-destructive-foreground",
    //         completed: "bg-primary text-primary-foreground",
    //     }
    //     return variants[status as keyof typeof variants] || variants.current
    // }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Vendor Profile Header */}
                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={vendor.profileImage || "/placeholder.svg"} alt={vendor.name} />
                                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                        {vendor.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">{vendor.name}</h1>
                                        <p className="text-muted-foreground">{vendor.businessType}</p>
                                    </div>
                                    <Badge className={getStatusBadge(vendor.status)}>
                                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <VendorInfoItem icon={Mail} text={vendor.email} />
                                    <VendorInfoItem icon={Phone} text={vendor.phone} />
                                    <VendorInfoItem icon={MapPin} text={vendor.location} />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <VendorMetricsCard value={vendor.trustCirclesCount} label="Trust Circles" />
                                    <VendorMetricsCard value={vendor.totalWomen} label="Women Members" />
                                    <VendorMetricsCard value={`${vendor.repaymentRate}%`} label="Repayment Rate" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {vendor.status === "pending" && (
                    <div className="flex gap-4">
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isProcessing ? "Processing..." : "Approve Application"}
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isProcessing} className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            {isProcessing ? "Processing..." : "Reject Application"}
                        </Button>
                    </div>
                )}

                {/* Tabbed Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-muted">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trust-circles">Trust Circles</TabsTrigger>
                        <TabsTrigger value="women-members">Women Members</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Business Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Business Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Owner:</span>
                                            <span className="font-medium">{vendor.ownerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Business Type:</span>
                                            <span className="font-medium">{vendor.businessType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Location:</span>
                                            <span className="font-medium">{vendor.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Submitted:</span>
                                            <span className="font-medium">{new Date(vendor.submittedAt!).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guarantors */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Guarantors ({vendor.guarantors?.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {vendor.guarantors?.map((guarantor, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                                                <div>
                                                    <p className="font-medium">{guarantor.name}</p>
                                                    <p className="text-sm text-muted-foreground">{guarantor.relationship}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm">{guarantor.phone}</p>
                                                    <Badge variant="outline" className="text-xs bg-success text-success-foreground">
                                                        Verified
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trust-circles">
                        <DataTable
                            columns={trustCircleColumns}
                            data={vendor.trustCircles}
                            searchColumn="name"
                            searchPlaceholder="Search circles..."
                        />
                    </TabsContent>

                    <TabsContent value="women-members">
                        <DataTable
                            columns={womenColumns}
                            data={vendor.womenMembers}
                            searchColumn="name"
                            searchPlaceholder="Search women..."
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                        <DataTable
                            columns={documentColumns}
                            data={[
                                { id: 1, name: "BVN Document", type: "Bank Verification Number", status: "verified" },
                                { id: 2, name: "NIN Document", type: "National Identity Number", status: "verified" },
                                { id: 3, name: "Business License", type: "CAC Registration", status: "verified" },
                                { id: 4, name: "Guarantor Forms", type: "Completed Forms", status: "complete" }
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
