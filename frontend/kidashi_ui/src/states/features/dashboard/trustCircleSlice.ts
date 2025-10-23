import type { TrustCircles } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface TrustCirclesState {
    circles: TrustCircles[]
    loading: boolean
    error: string | null
    filter: "all" | "eligible" | "ineligible" | "active" | "pending"
    stats: {
        total_circles: number
        eligible_for_loans: number
        total_women: number
        average_repayment_rate: number
    }
}

const initialState: TrustCirclesState = {
    stats: {
        total_circles: 0,
        eligible_for_loans: 0,
        total_women: 0,
        average_repayment_rate: 0
    },
    circles: [],

    loading: false,
    error: null,
    filter: "all"
}

const trustCircleSlice = createSlice({
    name: "trustCircles",
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        setFilter(state, action: PayloadAction<TrustCirclesState["filter"]>) {
            state.filter = action.payload;
        },
        setCircles(state, action: PayloadAction<TrustCircles[]>) {
            state.circles = action.payload;
        },
        setStats(state, action: PayloadAction<TrustCirclesState["stats"]>) {
            state.stats = action.payload;
        }
    }
});

export const {
    setLoading,
    setError,
    setFilter,
    setCircles,
    setStats
} = trustCircleSlice.actions;

export default trustCircleSlice.reducer;
