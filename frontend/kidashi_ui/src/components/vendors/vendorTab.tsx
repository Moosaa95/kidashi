import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, FileText, Shield, UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/datatable"
import { trustCircleColumns, womenColumns, documentColumns } from "@/components/vendors/vendorColumn"

interface VendorTabsProps {
    vendor: any
}

export default function VendorTabs({ vendor }: VendorTabsProps) {
    const trustCircles = vendor.trust_circles ?? []
    const womenMembers = vendor.women_members ?? []
    const documents =
        vendor.documents?.length
            ? vendor.documents
            : [
                { id: 1, name: "BVN Document", type: "Bank Verification Number", status: "verified" },
                { id: 2, name: "NIN Document", type: "National Identity Number", status: "verified" },
                { id: 3, name: "Business License", type: "CAC Registration", status: "verified" },
                { id: 4, name: "Guarantor Forms", type: "Completed Forms", status: "complete" },
            ]

    return (
        <Tabs defaultValue="overview" className="space-y-6 mt-6">
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

            <TabsContent value="overview">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" /> Guarantors ({vendor.guarantors?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(vendor.guarantors ?? []).length ? (
                            (vendor.guarantors ?? []).map((g: any, index: number) => {
                                const name = [g.first_name, g.other_name, g.surname].filter(Boolean).join(" ")
                                const status = (g.verification_status || "Pending").toLowerCase()
                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div>
                                            <p className="font-medium">{name || "Guarantor"}</p>
                                            <p className="text-sm text-muted-foreground">{g.relationship || "Not specified"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm">{g.phone || "N/A"}</p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${status === "verified"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
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
            </TabsContent>

            <TabsContent value="trust-circles">
                <DataTable
                    columns={trustCircleColumns}
                    data={trustCircles}
                    searchColumn="name"
                    searchPlaceholder="Search trust circles..."
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
    )
}
