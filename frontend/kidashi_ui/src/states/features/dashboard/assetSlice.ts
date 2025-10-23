import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Asset } from "@/types/global"

interface AssetState {
    assets: Asset[]
    filter: "all" | "REQUESTED" | "APPROVED" | "RUNNING" | "CLOSED" | "REJECTED" | "FAILED"
    stats: {
        total_assets: number
        total_pending_assets: number
        total_ongoing_assets: number
        total_completed_assets: number
        total_failed_assets: number
        total_asset_value: number
    }
}

const initialState: AssetState = {
    assets: [],
    filter: "all",
    stats: {
        total_assets: 0,
        total_pending_assets: 0,
        total_ongoing_assets: 0,
        total_completed_assets: 0,
        total_failed_assets: 0,
        total_asset_value: 0,
    },
}

const assetSlice = createSlice({
    name: "assets",
    initialState,
    reducers: {
        setAssets(state, action: PayloadAction<Asset[]>) {
            state.assets = action.payload
        },
        setFilter(state, action: PayloadAction<AssetState["filter"]>) {
            state.filter = action.payload
        },
        setStats(state, action: PayloadAction<AssetState["stats"]>) {
            state.stats = action.payload
        },
        clearAssets(state) {
            state.assets = []
            state.filter = "all"
            state.stats = initialState.stats
        },
    },
})

export const { setAssets, setFilter, setStats, clearAssets } = assetSlice.actions
export default assetSlice.reducer
