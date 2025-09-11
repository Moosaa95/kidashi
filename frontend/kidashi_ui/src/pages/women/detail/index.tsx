import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/datatable"
import {
    Phone, UserCheck, UserX, CreditCard, Clock, Mail, MapPin, Users,
    TrendingUp, Edit, Bell, Shield, Calendar, ArrowRight, Download,
    BarChart3, FileText, History, CircleDollarSign, Target
} from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import { useAppSelector } from "@/states/app/hooks"

export default function WomenDetailPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const { stats } = useAppSelector(state => state.women)

    const statData = [
        {
            name: "Total Loans",
            value: "₦60,000",
            icon: "CircleDollarSign",
            trend: "neutral",
            description: "All time loans taken",
            change: "+12% from last year"
        },
        {
            name: "Active Loans",
            value: "₦25,000",
            icon: "Clock",
            trend: "up",
            description: "Currently ongoing loans",
            change: "1 active loan"
        },
        {
            name: "Repayment Rate",
            value: `${stats.repaid_loans}%`,
            icon: "TrendingUp",
            trend: "up",
            description: "On-time repayment percentage",
            change: "+5% from last month"
        },
        {
            name: "Membership",
            value: `9 months`,
            icon: "Calendar",
            trend: "neutral",
            description: "Time with the program",
            change: "Joined Feb 2024"
        },
    ]

    const womanData = {
        id: 32,
        name: "Araft Bello",
        phone: "09029029909",
        status: "active",
        repaymentStatus: "current",
        circleName: "Kidhasas Group",
        vendorName: "Mustafa Mallam",
        location: "Kaduna, Nigeria",
        circleRepaymentRate: "92",
        circleId: 3,
        email: "araft.bello@example.com",
        joinDate: "2024-02-15",
        lastLoanDate: "2024-10-20",
        profileImage: "/woman-avatar.jpg",
        business: "Textile Trading",
        nextPaymentDate: "2024-11-15",
        nextPaymentAmount: "₦8,500"
    }

    // Mock loan data for the table
    const loanData = [
        {
            id: "LN-001",
            amount: "₦25,000",
            date: "2024-10-20",
            dueDate: "2024-11-20",
            status: "active",
            repaid: "₦5,000",
            progress: 20
        },
        {
            id: "LN-002",
            amount: "₦20,000",
            date: "2024-07-15",
            dueDate: "2024-08-15",
            status: "repaid",
            repaid: "₦20,000",
            progress: 100
        },
        {
            id: "LN-003",
            amount: "₦15,000",
            date: "2024-04-10",
            dueDate: "2024-05-10",
            status: "repaid",
            repaid: "₦15,000",
            progress: 100
        },
    ]

    // Mock repayment history
    const repaymentHistory = [
        { date: "2024-11-05", amount: "₦2,500", method: "Bank Transfer", status: "completed" },
        { date: "2024-10-28", amount: "₦2,500", method: "Cash", status: "completed" },
        { date: "2024-10-21", amount: "₦2,500", method: "Mobile Money", status: "completed" },
        { date: "2024-10-14", amount: "₦2,500", method: "Bank Transfer", status: "completed" },
    ]

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-6">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                                    <AvatarImage src={womanData.profileImage} alt={womanData.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                        {womanData.name.split(" ").map((n: string) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{womanData.name}</h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            {womanData.phone}
                                        </p>
                                        <span className="text-muted-foreground">•</span>
                                        <p className="text-sm text-muted-foreground">ID: {womanData.id}</p>
                                        <span className="text-muted-foreground">•</span>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Joined {new Date(womanData.joinDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Badge
                                            className={`px-2 py-1 text-xs ${womanData.status === "active"
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }`}
                                        >
                                            {womanData.status === "active" ? (
                                                <UserCheck className="h-3 w-3 mr-1" />
                                            ) : (
                                                <UserX className="h-3 w-3 mr-1" />
                                            )}
                                            {womanData.status}
                                        </Badge>
                                        <Badge
                                            className={`px-2 py-1 text-xs ${womanData.repaymentStatus === "current"
                                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                                : womanData.repaymentStatus === "overdue"
                                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }`}
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            {womanData.repaymentStatus}
                                        </Badge>
                                        <Badge className="px-2 py-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                                            <Target className="h-3 w-3 mr-1" />
                                            {womanData.business}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="gap-1">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <Bell className="h-4 w-4" />
                                    Remind
                                </Button>
                                <Button variant="destructive" size="sm">
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t">
                        {statData.map((stat, index) => (
                            <StatCard
                                key={index}
                                name={stat.name}
                                value={stat.value}
                                icon={stat.icon}
                                // trend={stat.trend}
                                description={stat.description}
                            // change={stat.change}
                            />
                        ))}
                    </div>
                </div>

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full grid grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                        <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="loans" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <CreditCard className="h-4 w-4" />
                            Loans
                        </TabsTrigger>
                        <TabsTrigger value="repayments" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <History className="h-4 w-4" />
                            Repayments
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <FileText className="h-4 w-4" />
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Contact Info Card */}
                            <Card className="lg:col-span-1 border shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-primary" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">{womanData.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{womanData.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{womanData.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Business</p>
                                            <p className="text-sm text-muted-foreground">{womanData.business}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trust Circle Info & Upcoming Payment */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Trust Circle Info */}
                                <Card className="border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary" />
                                            Trust Circle
                                        </CardTitle>
                                        <CardDescription>Circle and vendor association</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium text-lg">{womanData.circleName}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Shield className="h-4 w-4" />
                                                    Managed by: {womanData.vendorName}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {womanData.location}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center">
                                                        <div className="h-2 w-20 bg-primary/20 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500"
                                                                style={{ width: `${womanData.circleRepaymentRate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {womanData.circleRepaymentRate}% Repayment Rate
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button asChild className="gap-1">
                                                <a href={`/dashboard/trust-circles/${womanData.circleId}`}>
                                                    View Circle
                                                    <ArrowRight className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Upcoming Payment */}
                                <Card className="border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            Upcoming Payment
                                        </CardTitle>
                                        <CardDescription>Next scheduled repayment</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="space-y-1">
                                                <p className="font-medium text-lg text-blue-800">{womanData.nextPaymentAmount}</p>
                                                <p className="text-sm text-blue-600">Due on {womanData.nextPaymentDate}</p>
                                                <p className="text-xs text-blue-500">For loan LN-001</p>
                                            </div>
                                            <Button className="gap-1 bg-blue-600 hover:bg-blue-700">
                                                <Download className="h-4 w-4" />
                                                Download Invoice
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Loans Tab */}
                    <TabsContent value="loans" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle>Loan History</CardTitle>
                                <CardDescription>All loans taken and repayment progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <div className="grid grid-cols-6 p-4 bg-muted/50 font-medium text-sm">
                                        <div>Loan ID</div>
                                        <div>Amount</div>
                                        <div>Date</div>
                                        <div>Due Date</div>
                                        <div>Status</div>
                                        <div>Progress</div>
                                    </div>
                                    {loanData.map((loan) => (
                                        <div key={loan.id} className="grid grid-cols-6 p-4 border-t text-sm items-center">
                                            <div className="font-medium text-primary">{loan.id}</div>
                                            <div className="font-semibold">{loan.amount}</div>
                                            <div>{loan.date}</div>
                                            <div>{loan.dueDate}</div>
                                            <div>
                                                <Badge
                                                    className={
                                                        loan.status === "active"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-green-100 text-green-800"
                                                    }
                                                >
                                                    {loan.status}
                                                </Badge>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${loan.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{loan.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Repayments Tab */}
                    <TabsContent value="repayments" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle>Repayment History</CardTitle>
                                <CardDescription>All repayment transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <div className="grid grid-cols-4 p-4 bg-muted/50 font-medium text-sm">
                                        <div>Date</div>
                                        <div>Amount</div>
                                        <div>Method</div>
                                        <div>Status</div>
                                    </div>
                                    {repaymentHistory.map((repayment, index) => (
                                        <div key={index} className="grid grid-cols-4 p-4 border-t text-sm items-center">
                                            <div>{repayment.date}</div>
                                            <div className="font-semibold">{repayment.amount}</div>
                                            <div>{repayment.method}</div>
                                            <div>
                                                <Badge className="bg-green-100 text-green-800">
                                                    {repayment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>All documents associated with this member</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">ID Verification Document</p>
                                                <p className="text-sm text-muted-foreground">Uploaded on 2024-02-15</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Loan Agreement - LN-001</p>
                                                <p className="text-sm text-muted-foreground">Signed on 2024-10-20</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Business Registration</p>
                                                <p className="text-sm text-muted-foreground">Uploaded on 2024-02-18</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
