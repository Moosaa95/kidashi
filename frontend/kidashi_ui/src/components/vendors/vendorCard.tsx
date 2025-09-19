import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Building2 } from "lucide-react"
import { useState } from "react"
import type { Vendor } from "@/types/global"
import { getStatusBadge, getStatusIcon } from "./vendorStatus"
import VendorDialog from "./vendorDialog"

interface VendorCardProps {
    vendor: Vendor
    onApprove: (id: string, name: string) => void
    onReject: (id: string, name: string) => void
}

export default function VendorCard({ vendor, onApprove, onReject }: VendorCardProps) {
    const [open, setOpen] = useState(false)

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    {/* Vendor Info */}
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{vendor.first_name} {vendor.surname}</h3>
                            <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(vendor.status)}
                                <Badge variant={getStatusBadge(vendor.status) as any}>{vendor.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Applied {vendor.application_date}</p>
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                        </Button>
                    </div>
                </div>
            </CardContent>

            <VendorDialog
                vendor={vendor}
                open={open}
                onOpenChange={setOpen}
                onApprove={onApprove}
                onReject={onReject}
            />
        </Card>
    )
}
