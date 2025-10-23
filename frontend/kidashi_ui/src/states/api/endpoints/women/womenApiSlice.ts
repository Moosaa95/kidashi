import type { WomanDetail, WomanFilters, WomanSummary } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface WomenMetrics {
    total_women: number
    active_women: number
    inactive_women: number
    suspended_women: number
    active_percentage?: number
    inactive_percentage?: number
    suspended_percentage?: number
}

export interface WomanResponse {
    status: boolean
    message: string
    data: WomanSummary[] | {
        women: WomanSummary[]
        summary: WomenMetrics
    }
}

export interface AssetSummary {
    total_assets: number
    total_asset_value: number
    total_pending_assets: number
    total_ongoing_assets: number
    total_completed_assets: number
    total_failed_assets: number
    total_ongoing_value: number
    total_completed_value: number
    total_ongoing_markup: number
    total_completed_markup: number
    member_ongoing_assets?: number
    member_today_completed_assets?: number
    member_total_completed_assets?: number
    member_pending_assets?: number
    member_failed_assets?: number
    member_ongoing_value?: number
    member_total_completed_value?: number
    member_today_completed_value?: number
}

export interface WomanDetailResponse {
    status: boolean
    message: string
    data?: WomanDetail | WomanSummary | null
    summary?: AssetSummary
}

const womenApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getWomanDetail: builder.mutation<WomanDetailResponse, { woman_id: string; include_summary?: boolean }>({
            query: (body) => ({
                url: `woman/staff/get_woman_detail`,
                method: "POST",
                body,
            }),
        }),
        fetchWomen: builder.query<WomanResponse, { filters?: WomanFilters; include_summary?: boolean } | void>({
            query: (arg) => {
                const filters = arg?.filters || {};
                const include_summary = arg?.include_summary || false;
                return {
                    url: `woman/staff/fetch_women`,
                    method: "POST",
                    body: { ...filters, include_summary }
                };
            },
            transformResponse: (response: WomanResponse): WomanResponse => {
                // Handle both response formats
                if (Array.isArray(response.data)) {
                    return response;
                }
                // If data has women and summary, keep it as is
                return response;
            },
        }),
    }),
})

export const {
    useGetWomanDetailMutation,
    useFetchWomenQuery,
} = womenApiSlice
