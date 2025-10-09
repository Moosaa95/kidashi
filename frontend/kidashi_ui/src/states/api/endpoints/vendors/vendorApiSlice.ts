import type { Vendor, VendorDetail, VendorGuarantor, VendorStatus } from "@/types/global";
import { apiSlice } from "../../apiSlice";



export interface VendorResponse {
    status: boolean;
    message: string;
    data: Vendor[];
}


export interface VendorDetailResponse {
    status: boolean;
    message: string;
    data: VendorDetail | null;
}


export interface GuarantorVerificationResponse {
    status: boolean;
    message: string;
    data: VendorGuarantor;
}



const vendorApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVendorDetail: builder.mutation<VendorDetailResponse, { vendor_id: string }>({
            query: ({ vendor_id }) => ({
                url: 'vendor/staff/get_vendor_details',
                method: 'POST',
                body: { vendor_id }
            }),
        }),
        fetchVendors: builder.query<VendorResponse, Record<string, unknown> | void>({
            query: (filters = {}) => ({
                url: 'vendor/staff/fetch_vendors',
                method: 'POST',
                body: { filters }
            }),
        }),
        // fetchPendingVendors: builder.query<VendorResponse, Record<string, unknown> | void>({
        //     query: (filters = {}) => ({
        //         url: 'vendor/staff/fetch_pending_vendors',
        //         method: 'POST',
        //         body: { ...filters }
        //     }),
        // }),
        updateVendorApplicationStatus: builder.mutation<{ status: boolean; message: string }, { vendor_id: string; status: VendorStatus | string }>({
            query: ({ vendor_id, status }) => ({
                url: 'vendor/staff/update_vendor_application_status',
                method: 'POST',
                body: { vendor_id, status }
            }),
        }),
        updateGuarantorVerificationStatus: builder.mutation<GuarantorVerificationResponse, { guarantor_id: string; verification_status?: string }>({
            query: ({ guarantor_id, verification_status = 'VERIFIED' }) => ({
                url: 'vendor/staff/update_guarantor_verification_status',
                method: 'POST',
                body: { guarantor_id, verification_status },
            }),
        }),
    }),
});
export const {
    useGetVendorDetailMutation,
    useFetchVendorsQuery,
    useUpdateVendorApplicationStatusMutation,
    useUpdateGuarantorVerificationStatusMutation,
} = vendorApiSlice;
