import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { DataTable } from "@/components/datatable"
import {
    Phone, UserCheck, UserX, CreditCard, Mail, MapPin, Users,
    Shield, Calendar, ArrowRight,
    BarChart3, Target, Loader2
} from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import { useGetWomanDetailMutation, type AssetSummary } from "@/states/api/endpoints/women/womenApiSlice"
import type { WomanDetail } from "@/types/global"

export default function WomenDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState("overview")
    const [woman, setWoman] = useState<WomanDetail | null>(null)
    const [summary, setSummary] = useState<AssetSummary | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isFetching, setIsFetching] = useState(false)

    const [getWomanDetail] = useGetWomanDetailMutation()

    useEffect(() => {
        if (!id) {
            setErrorMessage("Woman ID is required")
            return
        }

        let isMounted = true
        setIsFetching(true)
        setErrorMessage(null)

            ; (async () => {
                try {
                    const response = await getWomanDetail({ woman_id: id, include_summary: true }).unwrap()
                    if (!isMounted) return

                    if (!response.status || !response.data) {
                        setWoman(null)
                        setErrorMessage(response.message || "Woman not found")
                        return
                    }

                    setWoman(response.data as WomanDetail)
                    setSummary(response.summary || null)
                    console.log("[v0] Fetched woman detail:", response.data);

                } catch (error) {
                    if (!isMounted) return
                    setWoman(null)
                    setErrorMessage("Unable to fetch woman details")
                } finally {
                    if (isMounted) {
                        setIsFetching(false)
                    }
                }
            })()

        return () => {
            isMounted = false
        }
    }, [id, getWomanDetail])

    const statData = [
        // {
        //     name: "Total Assets",
        //     value: summary?.total_assets?.toString() || "0",
        //     icon: "CreditCard",
        //     description: "All time assets",
        // },
        {
            name: "Ongoing Assets",
            value: summary?.member_ongoing_assets?.toString() || "0",
            icon: "Clock",
            description: "Currently ongoing",
        },
        {
            name: "Completed Assets",
            value: summary?.member_total_completed_assets?.toString() || "0",
            icon: "CheckCircle",
            description: "Successfully completed",
        },
        {
            name: "Ongoing Value",
            value: summary?.member_ongoing_value ? `₦${summary.member_ongoing_value.toLocaleString()}` : "₦0",
            icon: "TrendingUp",
            description: "Total ongoing value",
        },
    ]

    if (isFetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Loading woman details...</span>
                </div>
            </div>
        )
    }

    if (errorMessage && !woman) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Unable to load woman</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!woman) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-6">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Woman not found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">We could not find the woman you requested.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const womanName = [woman.first_name, woman.other_name, woman.surname].filter(Boolean).join(" ")
    const initials = womanName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "W"

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-6">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                                    <AvatarImage src={woman.image || ""} alt={womanName} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{womanName}</h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            {woman.mobile_number || "N/A"}
                                        </p>
                                        {/* <span className="text-muted-foreground">•</span>
                                        <p className="text-sm text-muted-foreground">ID: {woman.id}</p> */}
                                        <span className="text-muted-foreground">•</span>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Joined {woman.created_at ? new Date(woman.created_at).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Badge
                                            className={`px-2 py-1 text-xs ${woman.status === "ACTIVE"
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }`}
                                        >
                                            {woman.status === "ACTIVE" ? (
                                                <UserCheck className="h-3 w-3 mr-1" />
                                            ) : (
                                                <UserX className="h-3 w-3 mr-1" />
                                            )}
                                            {woman.status}
                                        </Badge>
                                        <Badge
                                            className={`px-2 py-1 text-xs ${woman.repayment_status === "CURRENT"
                                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                                : woman.repayment_status === "LATE"
                                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }`}
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            {woman.repayment_status || "N/A"}
                                        </Badge>
                                        {woman.occupation && (
                                            <Badge className="px-2 py-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                <Target className="h-3 w-3 mr-1" />
                                                {woman.occupation}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* <div className="flex flex-wrap gap-2">
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
                            </div> */}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t">
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
                    <TabsList className="w-full bg-card p-1 h-auto rounded-lg border shadow-sm">
                        <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Overview
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
                                            <p className="text-sm text-muted-foreground">{woman.email || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{woman.mobile_number || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{woman.residential_address || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Occupation</p>
                                            <p className="text-sm text-muted-foreground">{woman.occupation || "N/A"}</p>
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
                                                <p className="font-medium text-lg">Trust Circle Name: {woman.trust_circle__circle_name || "Not Assigned"}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Shield className="h-4 w-4" />
                                                    Vendor fullName: {`${woman.vendor__first_name || ""} ${woman.vendor__surname || ""}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {woman.state || "N/A"}, {woman.country || "N/A"}
                                                </p>
                                            </div>
                                            {woman.trust_circle_id && (
                                                <Button asChild className="gap-1">
                                                    <a href={`/dashboard/trust-circles/${woman.trust_circle_id}`}>
                                                        View Circle
                                                        <ArrowRight className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Account Information */}
                                <Card className="border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            Account Information
                                        </CardTitle>
                                        <CardDescription>Banking and verification details</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                                                <span className="text-sm font-medium">Account Number:</span>
                                                <span className="text-sm text-muted-foreground">{woman.account_number || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                                                <span className="text-sm font-medium">NIN:</span>
                                                <span className="text-sm text-muted-foreground">{woman.nin || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                                                <span className="text-sm font-medium">BVN:</span>
                                                <span className="text-sm text-muted-foreground">{woman.bvn || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                                                <span className="text-sm font-medium">Tier:</span>
                                                <span className="text-sm text-muted-foreground">{woman.tier || "N/A"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
