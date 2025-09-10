import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts"
import { TrendingUp, TrendingDown, CreditCard, DollarSign, Smartphone, Download } from "lucide-react"

const vendorPerformanceData = [
    {
        vendorName: "Khadija Enterprises",
        location: "Kaduna State",
        communitiesCreated: 5,
        womenOnboarded: 47,
        totalLoans: 35,
        repaymentRate: 96.8,
        totalVolume: 1400000,
        avgLoanSize: 40000,
        joinedDate: "2023-11-20",
        performance: "excellent",
    },
    {
        vendorName: "Blessing Provisions",
        location: "Lagos State",
        communitiesCreated: 3,
        womenOnboarded: 28,
        totalLoans: 22,
        repaymentRate: 94.2,
        totalVolume: 880000,
        avgLoanSize: 40000,
        joinedDate: "2023-10-15",
        performance: "good",
    },
    {
        vendorName: "Hauwa General Store",
        location: "Sokoto State",
        communitiesCreated: 3,
        womenOnboarded: 28,
        totalLoans: 18,
        repaymentRate: 91.5,
        totalVolume: 720000,
        avgLoanSize: 40000,
        joinedDate: "2023-12-01",
        performance: "fair",
    },
    {
        vendorName: "Zainab Fashion Hub",
        location: "Kano State",
        communitiesCreated: 2,
        womenOnboarded: 19,
        totalLoans: 12,
        repaymentRate: 88.3,
        totalVolume: 480000,
        avgLoanSize: 40000,
        joinedDate: "2023-09-10",
        performance: "needs_improvement",
    },
]

const monthlyTrendsData = [
    { month: "Jul", loans: 45, repayments: 42, newVendors: 2, newWomen: 23 },
    { month: "Aug", loans: 52, repayments: 48, newVendors: 3, newWomen: 31 },
    { month: "Sep", loans: 48, repayments: 46, newVendors: 1, newWomen: 19 },
    { month: "Oct", loans: 61, repayments: 58, newVendors: 2, newWomen: 28 },
    { month: "Nov", loans: 67, repayments: 63, newVendors: 1, newWomen: 47 },
    { month: "Dec", loans: 73, repayments: 69, newVendors: 0, newWomen: 35 },
    { month: "Jan", loans: 58, repayments: 55, newVendors: 0, newWomen: 22 },
]

const communityPerformanceData = [
    { name: "Katsina Women Cooperative", members: 12, loans: 8, repaymentRate: 100, totalVolume: 320000 },
    { name: "Lagos Market Women", members: 8, loans: 5, repaymentRate: 100, totalVolume: 200000 },
    { name: "Kaduna Fashion Circle", members: 15, loans: 12, repaymentRate: 91.7, totalVolume: 480000 },
    { name: "Kano Business Group", members: 10, loans: 7, repaymentRate: 85.7, totalVolume: 280000 },
    { name: "Sokoto Traders Group", members: 2, loans: 0, repaymentRate: 0, totalVolume: 0 },
]

const womenParticipationData = [
    { category: "With Smartphone", count: 67, percentage: 55.8, color: "#15803d" },
    { category: "Without Smartphone", count: 53, percentage: 44.2, color: "#84cc16" },
]

const transactionTypeData = [
    { type: "Loan Repayments", count: 156, volume: 6240000, color: "#15803d" },
    { type: "Airtime Purchase", count: 89, volume: 89000, color: "#84cc16" },
    { type: "Data Purchase", count: 67, volume: 100500, color: "#f97316" },
    { type: "Utility Payments", count: 34, volume: 119000, color: "#d97706" },
    { type: "Peer Transfers", count: 23, volume: 46000, color: "#ea580c" },
]

const financialOverview = {
    totalDisbursed: 2400000,
    totalRepaid: 1800000,
    outstandingBalance: 600000,
    defaultedAmount: 120000,
    repaymentRate: 94.2,
    portfolioGrowth: 23.5,
    avgLoanSize: 40000,
    totalActiveLoans: 87,
}

export default function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState("6months")
    // const [selectedMetric, setSelectedMetric] = useState("all")
    console.log("========ANALYTICS");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Comprehensive insights into vendor performance, community health, loan portfolio, and platform growth.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1month">Last Month</SelectItem>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Disbursed</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ₦{(financialOverview.totalDisbursed / 1000000).toFixed(1)}M
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-primary" />+{financialOverview.portfolioGrowth}% from last period
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Repayment Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{financialOverview.repaymentRate}%</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                            +2.1% from last period
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{financialOverview.totalActiveLoans}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                            +12 from last month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ₦{(financialOverview.outstandingBalance / 1000).toFixed(0)}K
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                            -8.5% from last period
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="vendors">Vendor Performance</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="communities">Community Reports</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="women">Women Participation</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="financial">Financial Analysis</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trends</CardTitle>
                                <CardDescription>Loan disbursements and repayments over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="loans" stroke="#15803d" strokeWidth={2} name="Loans Disbursed" />
                                        <Line type="monotone" dataKey="repayments" stroke="#84cc16" strokeWidth={2} name="Repayments" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Types Distribution</CardTitle>
                                <CardDescription>Breakdown of transaction types by volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={transactionTypeData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="volume"
                                            label={({ type, percentage }) => `${type}: ${percentage}%`}
                                        >
                                            {transactionTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [`₦${(value / 1000).toFixed(0)}K`, "Volume"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Growth</CardTitle>
                            <CardDescription>New vendors and women onboarded over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyTrendsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="newWomen"
                                        stackId="1"
                                        stroke="#15803d"
                                        fill="#15803d"
                                        fillOpacity={0.6}
                                        name="New Women"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="newVendors"
                                        stackId="1"
                                        stroke="#84cc16"
                                        fill="#84cc16"
                                        fillOpacity={0.6}
                                        name="New Vendors"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Vendor Performance Tab */}
                <TabsContent value="vendors" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Performance Comparison</CardTitle>
                            <CardDescription>Repayment rates and loan volumes by vendor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={vendorPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="vendorName" angle={-45} textAnchor="end" height={100} />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Bar yAxisId="left" dataKey="repaymentRate" fill="#15803d" name="Repayment Rate (%)" />
                                    <Bar yAxisId="right" dataKey="totalVolume" fill="#84cc16" name="Total Volume (₦)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6">
                        {vendorPerformanceData.map((vendor, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                                            <CardDescription>
                                                {vendor.location} • Joined {new Date(vendor.joinedDate).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                vendor.performance === "excellent"
                                                    ? "default"
                                                    : vendor.performance === "good"
                                                        ? "secondary"
                                                        : vendor.performance === "fair"
                                                            ? "outline"
                                                            : "destructive"
                                            }
                                        >
                                            {vendor.performance.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{vendor.communitiesCreated}</p>
                                            <p className="text-xs text-muted-foreground">Communities</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{vendor.womenOnboarded}</p>
                                            <p className="text-xs text-muted-foreground">Women Onboarded</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{vendor.repaymentRate}%</p>
                                            <p className="text-xs text-muted-foreground">Repayment Rate</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">₦{(vendor.totalVolume / 1000).toFixed(0)}K</p>
                                            <p className="text-xs text-muted-foreground">Total Volume</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Community Reports Tab */}
                <TabsContent value="communities" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Community Loan Uptake</CardTitle>
                            <CardDescription>Loan participation rates across communities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={communityPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="loans" fill="#15803d" name="Active Loans" />
                                    <Bar dataKey="members" fill="#84cc16" name="Total Members" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        {communityPerformanceData.map((community, index) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">{community.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {community.members} members • {community.loans} active loans
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-primary">{community.repaymentRate}%</p>
                                            <p className="text-xs text-muted-foreground">Repayment Rate</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-primary">
                                                ₦{(community.totalVolume / 1000).toFixed(0)}K
                                            </p>
                                            <p className="text-xs text-muted-foreground">Total Volume</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>Loan Uptake Rate</span>
                                            <span>
                                                {community.members > 0 ? Math.round((community.loans / community.members) * 100) : 0}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={community.members > 0 ? (community.loans / community.members) * 100 : 0}
                                            className="h-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Women Participation Tab */}
                <TabsContent value="women" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Smartphone vs Non-Smartphone Users</CardTitle>
                                <CardDescription>Distribution of women by device access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={womenParticipationData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            label={({ category, percentage }) => `${category}: ${percentage}%`}
                                        >
                                            {womenParticipationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Frequency by Device Type</CardTitle>
                                <CardDescription>Average transactions per user by device access</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-primary" />
                                            <span className="text-sm">With Smartphone</span>
                                        </div>
                                        <span className="font-medium">4.2 txns/month</span>
                                    </div>
                                    <Progress value={84} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded bg-secondary" />
                                            <span className="text-sm">Without Smartphone</span>
                                        </div>
                                        <span className="font-medium">2.8 txns/month</span>
                                    </div>
                                    <Progress value={56} className="h-2" />
                                </div>
                                <div className="pt-2 text-xs text-muted-foreground">
                                    Women with smartphones show 50% higher transaction frequency
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Women Participation Metrics</CardTitle>
                            <CardDescription>Key engagement and activity indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">120</p>
                                    <p className="text-sm text-muted-foreground">Total Women</p>
                                    <p className="text-xs text-muted-foreground mt-1">+15 this month</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">87</p>
                                    <p className="text-sm text-muted-foreground">Active Borrowers</p>
                                    <p className="text-xs text-muted-foreground mt-1">72.5% participation</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">67</p>
                                    <p className="text-sm text-muted-foreground">With Smartphones</p>
                                    <p className="text-xs text-muted-foreground mt-1">55.8% of total</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">3.5</p>
                                    <p className="text-sm text-muted-foreground">Avg Transactions</p>
                                    <p className="text-xs text-muted-foreground mt-1">per month</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Financial Analysis Tab */}
                <TabsContent value="financial" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio Health</CardTitle>
                                <CardDescription>Overall loan portfolio status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Performing Loans</span>
                                        <span className="font-medium">
                                            ₦{((financialOverview.totalRepaid / financialOverview.totalDisbursed) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(financialOverview.totalRepaid / financialOverview.totalDisbursed) * 100}
                                        className="h-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Outstanding</span>
                                        <span className="font-medium">₦{(financialOverview.outstandingBalance / 1000).toFixed(0)}K</span>
                                    </div>
                                    <Progress
                                        value={(financialOverview.outstandingBalance / financialOverview.totalDisbursed) * 100}
                                        className="h-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Defaulted</span>
                                        <span className="font-medium text-destructive">
                                            ₦{(financialOverview.defaultedAmount / 1000).toFixed(0)}K
                                        </span>
                                    </div>
                                    <Progress
                                        value={(financialOverview.defaultedAmount / financialOverview.totalDisbursed) * 100}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Loan Size Distribution</CardTitle>
                                <CardDescription>Average loan amounts by category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">First-time Borrowers</span>
                                    <span className="font-medium">₦35,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Repeat Borrowers</span>
                                    <span className="font-medium">₦45,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">High Performers</span>
                                    <span className="font-medium">₦50,000</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-sm font-medium">Overall Average</span>
                                    <span className="font-bold">₦{(financialOverview.avgLoanSize / 1000).toFixed(0)}K</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Metrics</CardTitle>
                                <CardDescription>Platform revenue and growth</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Interest Revenue</span>
                                    <span className="font-medium">₦240K</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Transaction Fees</span>
                                    <span className="font-medium">₦89K</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Late Fees</span>
                                    <span className="font-medium">₦12K</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-sm font-medium">Total Revenue</span>
                                    <span className="font-bold">₦341K</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Performance Over Time</CardTitle>
                            <CardDescription>Loan disbursements, repayments, and outstanding balances</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={monthlyTrendsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="loans"
                                        stackId="1"
                                        stroke="#15803d"
                                        fill="#15803d"
                                        fillOpacity={0.6}
                                        name="Loans Disbursed"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="repayments"
                                        stackId="2"
                                        stroke="#84cc16"
                                        fill="#84cc16"
                                        fillOpacity={0.6}
                                        name="Repayments Received"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
