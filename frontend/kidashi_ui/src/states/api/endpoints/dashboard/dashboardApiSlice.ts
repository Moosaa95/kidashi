import { apiSlice } from "../../apiSlice";

export interface DashboardMetricsData {
    vendors: {
        total_vendors: number;
        active_vendors: number;
        pending_vendors: number;
        rejected_vendors: number;
        suspended_vendors: number;
    };
    trust_circles: {
        total_circles: number;
        active_circles: number;
        forming_circles: number;
        eligible_circles: number;
    };
    women: {
        total_women: number;
        active_women: number;
        inactive_women: number;
        suspended_women: number;
        on_track_repayment: number;
        at_risk_repayment: number;
        defaulted_repayment: number;
    };
    assets: {
        total_loans: number;
        total_value_disbursed: number;
        requested_assets: number;
        approved_assets: number;
        running_assets: number;
        closed_assets: number;
        rejected_assets: number;
        failed_assets: number;
        total_ongoing_value: number;
        completed_assets_value: number;
    };
}

export interface DashboardMetricsResponse {
    status: boolean;
    message: string;
    data: DashboardMetricsData;
}

const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDashboardMetrics: builder.query<DashboardMetricsResponse, void>({
            query: () => ({
                url: 'general/staff/get_dashboard_metrics',
                method: 'POST',
            }),
        }),
        getPendingVendors: builder.query<any, { filters?: { status?: string } }>({
            query: (arg) => {
                const filters = arg?.filters ?? { status: "PENDING" };
                return {
                    url: 'vendor/staff/fetch_vendors',
                    method: 'POST',
                    body: { filters },
                };
            },
        }),
    }),
});

export const {
    useGetDashboardMetricsQuery,
    useLazyGetDashboardMetricsQuery,
    useGetPendingVendorsQuery,
    useLazyGetPendingVendorsQuery,
} = dashboardApiSlice;
