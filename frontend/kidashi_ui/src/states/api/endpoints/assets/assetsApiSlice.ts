import type { Asset, AssetFilters } from "@/types/global"
import { apiSlice } from "../../apiSlice"

export interface AssetMetrics {
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
}

export interface AssetResponse {
    status: boolean
    message?: string
    data: Asset[]
    summary?: AssetMetrics
}

export interface AssetDetailResponse {
    status: boolean
    message?: string
    data?: {
        asset: Asset
        metrics?: {
            disbursement_date?: string
            maturity_date?: string
            amount_unpaid?: number
            amount_repaid?: number
            repayment_progress?: number
            principal_balance_left?: number
        }
    } | null
}

const assetsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        fetchAssets: builder.query<AssetResponse, { filters?: AssetFilters; include_summary?: boolean } | void>({
            query: (arg) => {
                const filters = arg?.filters || {};
                const include_summary = arg?.include_summary || false;
                return {
                    url: `asset/staff/fetch_assets`,
                    method: "POST",
                    body: { filters, include_summary }
                };
            },
        }),
        getAssetDetail: builder.mutation<AssetDetailResponse, { asset_id?: string; loan_id?: string }>({
            query: (body) => ({
                url: `asset/staff/get_asset`,
                method: "POST",
                body,
            }),
        }),
    }),
})

export const {
    useFetchAssetsQuery,
    useGetAssetDetailMutation,
} = assetsApiSlice
