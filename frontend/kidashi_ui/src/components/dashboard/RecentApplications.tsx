import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle, Clock, AlertTriangle, Eye } from "lucide-react"

interface Application {
    id: string
    vendorName: string
    location: string
    status: "pending" | "approved" | "under_review" | "rejected" | "suspended"
    submittedAt: string
    guarantors: number
}

interface RecentApplicationsProps {
    applications: Application[]
    onReview: (id: string, name: string) => void
    onViewAll: () => void
}

export default function RecentApplications({ applications, onReview, onViewAll }: RecentApplicationsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Recent Vendor Applications
                </CardTitle>
                <CardDescription>Latest vendor registration requests requiring review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div>
                            <p className="font-medium">{app.vendorName}</p>
                            <p className="text-sm text-muted-foreground">{app.location}</p>
                            <p className="text-xs text-muted-foreground">
                                {app.guarantors} guarantors • {app.submittedAt}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    app.status === "approved" ? "default" : app.status === "pending" ? "secondary" : "outline"
                                }
                            >
                                {app.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {app.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {app.status === "under_review" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {app.status.replace("_", " ")}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => onReview(app.id, app.vendorName)}>
                                <Eye className="h-3 w-3 mr-1" /> Review
                            </Button>
                        </div>
                    </div>
                ))}
                <Button className="w-full" variant="outline" onClick={onViewAll}>
                    View All Applications
                </Button>
            </CardContent>
        </Card>
    )
}
