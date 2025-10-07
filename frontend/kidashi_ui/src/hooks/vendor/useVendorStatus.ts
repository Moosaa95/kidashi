import { toast } from "sonner"
import { useUpdateVendorApplicationStatusMutation } from "@/states/api/endpoints/vendors/vendorApiSlice"
import { getErrorMessage } from "@/lib/utils"

export function useVendorStatus() {
    const [updateVendorStatus, { isLoading }] = useUpdateVendorApplicationStatusMutation()

    const updateStatus = async (vendorId: string, nextStatus: string) => {
        try {
            const response = await updateVendorStatus({ vendor_id: vendorId, status: nextStatus }).unwrap()
            if (!response.status) {
                toast.error(response.message || "Unable to update vendor status")
                return false
            }
            toast.success(response.message || "Vendor status updated successfully")
            return true
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to update vendor status"))
            return false
        }
    }

    return { updateStatus, isLoading }
}
