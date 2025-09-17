import type { Vendor } from "@/types/global";
import { apiSlice } from "../../apiSlice";



export interface VendorResponse {
    status: boolean;
    message: string;
    data: Vendor[];
}




const vendorApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVendorDetail: builder.mutation({
            query: ({ vendor_id }) => ({
                url: '/vendor/get_vendor_details',
                method: 'POST',
                body: { id: vendor_id }
            }),
        }),
        fetchOnboardedVendors: builder.query<VendorResponse, Record<string, unknown> | void>({
            query: (filters = {}) => ({
                url: '/vendor/fetch_onboarded_vendors',
                method: 'POST',
                body: { ...filters }
            }),
        }),
        fetchPendingVendors: builder.query<VendorResponse, Record<string, unknown> | void>({
            query: (filters = {}) => ({
                url: '/vendor/fetch_pending_vendors',
                method: 'POST',
                body: { ...filters }
            }),
        }),
        updateVendorApplicationStatus: builder.mutation<{ status: boolean; message: string }, { vendor_id: string }>({
            query: ({ vendor_id }) => ({
                url: '/vendor/update_vendor_application_status',
                method: 'POST',
                body: { id: vendor_id }
            }),
        }),
    }),
});
export const {
    useGetVendorDetailMutation,
    useFetchOnboardedVendorsQuery,
    useFetchPendingVendorsQuery,
    useUpdateVendorApplicationStatusMutation,
} = vendorApiSlice;
