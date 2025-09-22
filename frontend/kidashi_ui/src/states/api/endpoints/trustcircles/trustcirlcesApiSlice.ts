import type { TrustCircles } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface TrustCircleResponse {
    status: boolean
    message: string
    data: TrustCircles[]
}

const circleApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        fetchTrustCircles: builder.query<TrustCircleResponse, Record<string, unknown> | void>({
            query: (filters = {}) => ({
                url: `trust_circle/staff/fetch_trust_circles`,
                method: "POST",
                body: filters
            }),
        }),
        getTrustCircleDetail: builder.query<TrustCircleResponse, string>({
            query: (id) => ({
                url: `trust_circle/staff/get_trust_circle_detail`,
                method: "POST",
                body: { trust_circle_id: id }
            }),
        }),
    }),
})

export const {
    useFetchTrustCirclesQuery,
    useGetTrustCircleDetailQuery,
} = circleApiSlice
