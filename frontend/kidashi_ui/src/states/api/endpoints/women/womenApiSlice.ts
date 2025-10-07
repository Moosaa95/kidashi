import type { WomanDetail, WomanFilters, WomanSummary } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface WomanResponse {
    status: boolean
    message: string
    data: WomanSummary[]
}

export interface WomanDetailResponse {
    status: boolean
    message: string
    data?: WomanDetail | WomanSummary | null
}

const womenApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getWomanDetail: builder.mutation<WomanDetailResponse, { woman_id: string }>({
            query: (body) => ({
                url: `woman/staff/get_woman_detail`,
                method: "POST",
                body,
            }),
        }),
        fetchWomen: builder.query<WomanResponse, WomanFilters | void>({
            query: (filters = {}) => ({
                url: `woman/staff/fetch_women`,
                method: "POST",
                body: filters
            }),
            transformResponse: (response: WomanResponse): WomanResponse => ({
                ...response,
                data: Array.isArray(response.data) ? response.data : [],
            }),
        }),
    }),
})

export const {
    useGetWomanDetailMutation,
    useFetchWomenQuery,
} = womenApiSlice
