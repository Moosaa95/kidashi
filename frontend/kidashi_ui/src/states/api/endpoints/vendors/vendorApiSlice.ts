import type { Vendor, VendorDetail, VendorGuarantor, VendorStatus } from "@/types/global";
import { apiSlice } from "../../apiSlice";



export interface VendorMetrics {
    total_vendors: number;
    active_vendors: number;
    pending_vendors: number;
    rejected_vendors: number;
    suspended_vendors: number;
}

export interface VendorResponse {
    status: boolean;
    message?: string;
    data: Vendor[];
    metrics?: VendorMetrics;
}


export interface VendorDetailMetrics {
    total_vendors: number;
    active_vendors: number;
    pending_vendors: number;
    rejected_vendors: number;
    suspended_vendors: number;
    total_circles: number;
    total_women: number;
    total_running_assets: number;
}

export interface VendorDetailData extends VendorDetail {
    metrics?: VendorDetailMetrics;
}

export interface VendorDetailResponse {
    status: boolean;
    message: string;
    data: VendorDetailData | null;
}


export interface GuarantorVerificationResponse {
    status: boolean;
    message: string;
    data: VendorGuarantor;
}



const vendorApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVendorDetail: builder.mutation<VendorDetailResponse, { vendor_id: string; include_summary?: boolean }>({
            query: ({ vendor_id, include_summary }) => ({
                url: 'vendor/staff/get_vendor_details',
                method: 'POST',
                body: { vendor_id, include_summary }
            }),
        }),
        fetchVendors: builder.query<VendorResponse, { filters?: Record<string, unknown> } | void>({
            query: (arg) => {
                const filters = arg?.filters || {};
                return {
                    url: 'vendor/staff/fetch_vendors',
                    method: 'POST',
                    body: { filters }
                };
            },
        }),
        // fetchPendingVendors: builder.query<VendorResponse, Record<string, unknown> | void>({
        //     query: (filters = {}) => ({
        //         url: 'vendor/staff/fetch_pending_vendors',
        //         method: 'POST',
        //         body: { ...filters }
        //     }),
        // }),
        updateVendorApplicationStatus: builder.mutation<{ status: boolean; message: string }, { vendor_id: string; status: VendorStatus | string; rejection_reason?: string }>({
            query: ({ vendor_id, status, rejection_reason }) => ({
                url: 'vendor/staff/update_vendor_application_status',
                method: 'POST',
                body: { vendor_id, status, rejection_reason }
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
