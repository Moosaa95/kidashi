import type { WomenMember } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface WomanResponse {
    status: boolean
    message: string
    data: WomenMember[]
}

const womenApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getWomanDetail: builder.mutation({
            query: (id: string) => ({
                url: `woman/staff/get_woman_detail`,
                method: "POST",
                body: { woman_id: id }
            }),
        }),
        fetchWomen: builder.query<WomanResponse, Record<string, unknown> | void>({
            query: (filters = {}) => ({
                url: `woman/staff/fetch_women`,
                method: "POST",
                body: filters
            }),
        }),
    }),
})

export const {
    useGetWomanDetailMutation,
    useFetchWomenQuery,
} = womenApiSlice
