import type { WomenMember } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface WomenState {
    women: WomenMember[]
    loading: boolean
    error: string | null
    filter: "all" | "current" | "overdue" | "none"
    stats: {
        total_women: number
        active_loans: number
        repaid_loans: number
        defaulted_loans: number
    }
}

const initialState: WomenState = {
    women: [
        {
            id: "W-001",
            circleId: "tc1",
            vendorId: "v001",
            name: "Hauwa Abdullahi",
            phone: "+234 806 789 0123",
            loanAmount: 50000,
            repaymentStatus: "current",
            joinDate: "2024-10-15",
        },
        {
            id: "W-002",
            circleId: "tc1",
            vendorId: "v001",
            name: "Zainab Mohammed",
            phone: "+234 807 890 1234",
            loanAmount: 75000,
            repaymentStatus: "current",
            joinDate: "2024-09-20",
        },
        {
            id: "W-003",
            circleId: "tc2",
            vendorId: "v002",
            name: "Aisha Ibrahim",
            phone: "+234 808 901 2345",
            loanAmount: 30000,
            repaymentStatus: "overdue",
            joinDate: "2024-08-10",
        }
    ],
    loading: false,
    error: null,
    filter: "all",
    stats: {
        total_women: 3,
        active_loans: 2,
        repaid_loans: 0,
        defaulted_loans: 1
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
        setWomen(state, action: PayloadAction<WomenMember[]>) {
            state.women = action.payload
        },
        setStats(state, action: PayloadAction<WomenState["stats"]>) {
            state.stats = action.payload
        },
        addWoman(state, action: PayloadAction<WomenMember>) {
            state.women.push(action.payload)
        },
        updateWoman(state, action: PayloadAction<WomenMember>) {
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
