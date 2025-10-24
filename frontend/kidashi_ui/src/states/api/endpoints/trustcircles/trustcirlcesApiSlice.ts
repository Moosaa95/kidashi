import type { TrustCircles } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface TrustCircleMetrics {
    total_circles: number
    active_circles: number
    forming_circles: number
    eligible_circles: number
}

export interface TrustCircleResponse {
    status: boolean
    message?: string
    count?: number
    data: TrustCircles[]
    summary?: TrustCircleMetrics
}

export interface TrustCircleDetailResponse {
    status: boolean
    message?: string
    data?: TrustCircles | null
}

const circleApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        fetchTrustCircles: builder.query<TrustCircleResponse, { filters?: Record<string, unknown>; count?: number; include_summary?: boolean } | void>({
            query: (arg) => {
                const filters = arg?.filters || {};
                const count = arg?.count;
                const include_summary = arg?.include_summary || false;
                return {
                    url: `trust_circle/staff/fetch_trust_circles`,
                    method: "POST",
                    body: { filters, count, include_summary }
                };
            },
        }),
        getTrustCircleDetail: builder.query<TrustCircleDetailResponse, { id?: string; include_summary?: boolean }>({
            query: ({ id, include_summary }) => ({
                url: `trust_circle/staff/get_trust_circle_detail`,
                method: "POST",
                body: { filters: { id }, include_summary }
            }),
        }),
    }),
})

export const {
    useFetchTrustCirclesQuery,
    useGetTrustCircleDetailQuery,
} = circleApiSlice
