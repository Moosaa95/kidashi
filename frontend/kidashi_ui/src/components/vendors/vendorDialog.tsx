
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import type { Vendor } from "@/types/global"

interface VendorDialogProps {
    vendor: Vendor
    open: boolean
    onOpenChange: (open: boolean) => void
    onApprove: (id: string, name: string) => void
    onReject: (id: string, name: string) => void
}

export default function VendorDialog({
    vendor,
    open,
    onOpenChange,
    onApprove,
    onReject,
}: VendorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Vendor Application Review</DialogTitle>
                    <DialogDescription>
                        Review vendor details and make approval decision
                    </DialogDescription>
                </DialogHeader>

                {/* Vendor details */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Vendor Information</h4>
                            <p><strong>Name:</strong> {vendor.first_name} {vendor.surname}</p>
                            <p><strong>Email:</strong> {vendor.email}</p>
                            <p><strong>Phone:</strong> {vendor.phone}</p>
                            <p><strong>Location:</strong> {vendor.location}</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Guarantor</h4>
                            <p><strong>Name:</strong> {vendor.guarantor_name}</p>
                            <p><strong>Phone:</strong> {vendor.guarantor_phone}</p>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">{vendor.trust_circles_count}</div>
                            <p className="text-xs">Trust Circles</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">{vendor.total_women}</div>
                            <p className="text-xs">Total Women</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">{vendor.repayment_rate}%</div>
                            <p className="text-xs">Repayment Rate</p>
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <h4 className="font-medium mb-2">Documents</h4>
                        <div className="flex gap-2">
                            {vendor.documents.map((doc, idx) => (
                                <Badge key={idx} variant="outline">
                                    {doc}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    {vendor.status === "PENDING" && (
                        <div className="flex gap-2">
                            <Button onClick={() => onApprove(vendor.id, vendor.first_name + " " + vendor.surname)} className="flex-1">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Vendor
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => onReject(vendor.id, vendor.first_name + " " + vendor.surname)}
                                className="flex-1"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
