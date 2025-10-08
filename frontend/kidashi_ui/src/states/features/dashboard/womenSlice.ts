import type { WomanSummary } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface WomenState {
    women: WomanSummary[]
    loading: boolean
    error: string | null
    filter: "all" | "withLoans" | "noLoans" | "overdue"
    stats: {
        total_women: number
        active_loans: number
        repaid_loans: number
        defaulted_loans: number
    }
}

const initialState: WomenState = {
    women: [],
    loading: false,
    error: null,
    filter: "all",
    stats: {
        total_women: 0,
        active_loans: 0,
        repaid_loans: 0,
        defaulted_loans: 0
    }
}

const womenSlice = createSlice({
    name: "women",
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload
        },
        setFilter(state, action: PayloadAction<WomenState["filter"]>) {
            state.filter = action.payload
        },
        setWomen(state, action: PayloadAction<WomanSummary[]>) {
            state.women = action.payload
        },
        setStats(state, action: PayloadAction<WomenState["stats"]>) {
            state.stats = action.payload
        },
        addWoman(state, action: PayloadAction<WomanSummary>) {
            state.women.push(action.payload)
        },
        updateWoman(state, action: PayloadAction<WomanSummary>) {
            const index = state.women.findIndex((w: any) => w.id === action.payload.id)
            if (index !== -1) {
                state.women[index] = action.payload
            }
        },
        removeWoman(state, action: PayloadAction<string>) {
            state.women = state.women.filter((w: any) => w.id !== action.payload)
        }
    }
})

export const {
    setLoading,
    setError,
    setFilter,
    setWomen,
    setStats,
    addWoman,
    updateWoman,
    removeWoman
} = womenSlice.actions

export default womenSlice.reducer
