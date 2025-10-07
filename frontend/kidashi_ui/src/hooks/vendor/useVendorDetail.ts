import { useEffect, useState } from "react"
import { useGetVendorDetailMutation } from "@/states/api/endpoints/vendors/vendorApiSlice"
import { getErrorMessage } from "@/lib/utils"

export function useVendorDetail(vendorId?: string) {
    const [vendor, setVendor] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isFetchingVendor, setIsFetchingVendor] = useState(false)
    const [getVendorDetail] = useGetVendorDetailMutation()

    useEffect(() => {
        if (!vendorId) {
            setErrorMessage("Vendor ID is required")
            return
        }

        let isMounted = true
        setIsFetchingVendor(true)

            ; (async () => {
                try {
                    const response = await getVendorDetail({ vendor_id: vendorId }).unwrap()
                    if (!isMounted) return

                    if (!response.status || !response.data) {
                        setVendor(null)
                        setErrorMessage(response.message || "Vendor not found")
                    } else {
                        setVendor(response.data)
                        setErrorMessage(null)
                    }
                } catch (error) {
                    if (!isMounted) return
                    setVendor(null)
                    setErrorMessage(getErrorMessage(error, "Unable to fetch vendor details"))
                } finally {
                    if (isMounted) setIsFetchingVendor(false)
                }
            })()

        return () => { isMounted = false }
    }, [vendorId, getVendorDetail])

    return { vendor, setVendor, errorMessage, isFetchingVendor }
}
