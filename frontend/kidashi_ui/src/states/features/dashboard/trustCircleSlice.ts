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
        total_circles: 10,
        eligible_for_loans: 6,
        total_women: 45,
        average_repayment_rate: 78.55
    },
    circles: [
        {
            id: "tc1",
            name: "Unguwan Rimi Circle",
            vendorId: "v001",
            vendorName: "Hajara Women Coop",
            location: "Unguwan Rimi, Kaduna North",
            womenCount: 8,
            eligibleForLoan: true,
            createdAt: "2024-01-10",
            status: "active",
            activeWomen: 7,
            inactiveWomen: 1,
            totalLoan: 5,
            activeLoan: 2,
            repaidLoan: 3,
            defaultLoan: 0,
            totalLoanAmount: 120000,
            repaymentRate: 85.5,
            lastActivity: "2024-06-01",
        },
        {
            id: "tc2",
            name: "Barnawa Cooperative",
            vendorId: "v002",
            vendorName: "Sadiya Traders Assoc.",
            location: "Barnawa, Kaduna South",
            womenCount: 5,
            eligibleForLoan: false,
            createdAt: "2024-02-15",
            status: "inactive",
            activeWomen: 2,
            inactiveWomen: 3,
            totalLoan: 2,
            activeLoan: 0,
            repaidLoan: 1,
            defaultLoan: 1,
            totalLoanAmount: 50000,
            repaymentRate: 60.0,
            lastActivity: "2024-05-20",
        },
        {
            id: "tc3",
            name: "Kawo Trust Group",
            vendorId: "v003",
            vendorName: "Amina Microfinance Agents",
            location: "Kawo, Kaduna North",
            womenCount: 3,
            eligibleForLoan: true,
            createdAt: "2024-03-05",
            status: "active",
            activeWomen: 3,
            inactiveWomen: 0,
            totalLoan: 3,
            activeLoan: 1,
            repaidLoan: 2,
            defaultLoan: 0,
            totalLoanAmount: 40000,
            repaymentRate: 90.0,
            lastActivity: "2024-06-03",
        },
        {
            id: "tc4",
            name: "Sabon Tasha Women Circle",
            vendorId: "v004",
            vendorName: "Rabi Cooperative Services",
            location: "Sabon Tasha, Chikun LGA",
            womenCount: 4,
            eligibleForLoan: true,
            createdAt: "2024-01-28",
            status: "inactive",
            activeWomen: 2,
            inactiveWomen: 2,
            totalLoan: 2,
            activeLoan: 1,
            repaidLoan: 1,
            defaultLoan: 0,
            totalLoanAmount: 35000,
            repaymentRate: 75.0,
            lastActivity: "2024-05-18",
        },
        {
            id: "tc5",
            name: "Rigasa Women Group",
            vendorId: "v005",
            vendorName: "Hadiza Market Women",
            location: "Rigasa, Igabi LGA",
            womenCount: 2,
            eligibleForLoan: false,
            createdAt: "2024-04-10",
            status: "inactive",
            activeWomen: 1,
            inactiveWomen: 1,
            totalLoan: 1,
            activeLoan: 0,
            repaidLoan: 0,
            defaultLoan: 1,
            totalLoanAmount: 15000,
            repaymentRate: 50.0,
            lastActivity: "2024-05-10",
        },
        {
            id: "tc6",
            name: "Tudun Wada Trust Circle",
            vendorId: "v006",
            vendorName: "Jamila Women Coop",
            location: "Tudun Wada, Kaduna South",
            womenCount: 6,
            eligibleForLoan: true,
            createdAt: "2024-02-22",
            status: "active",
            activeWomen: 5,
            inactiveWomen: 1,
            totalLoan: 4,
            activeLoan: 2,
            repaidLoan: 2,
            defaultLoan: 0,
            totalLoanAmount: 90000,
            repaymentRate: 80.0,
            lastActivity: "2024-06-02",
        },
        {
            id: "tc7",
            name: "Zaria Women Union",
            vendorId: "v007",
            vendorName: "Fatima Savings Group",
            location: "Zaria City, Kaduna State",
            womenCount: 7,
            eligibleForLoan: false,
            createdAt: "2024-03-18",
            status: "active",
            activeWomen: 6,
            inactiveWomen: 1,
            totalLoan: 3,
            activeLoan: 1,
            repaidLoan: 1,
            defaultLoan: 1,
            totalLoanAmount: 70000,
            repaymentRate: 65.0,
            lastActivity: "2024-06-04",
        },
        {
            id: "tc8",
            name: "Kafanchan Circle",
            vendorId: "v008",
            vendorName: "Grace Agro Women",
            location: "Kafanchan, Jema’a LGA",
            womenCount: 1,
            eligibleForLoan: true,
            createdAt: "2024-05-01",
            status: "inactive",
            activeWomen: 1,
            inactiveWomen: 0,
            totalLoan: 1,
            activeLoan: 0,
            repaidLoan: 1,
            defaultLoan: 0,
            totalLoanAmount: 10000,
            repaymentRate: 100.0,
            lastActivity: "2024-05-30",
        },
        {
            id: "tc9",
            name: "Gwagwada Women Group",
            vendorId: "v009",
            vendorName: "Lami Market Assoc.",
            location: "Gwagwada, Chikun LGA",
            womenCount: 3,
            eligibleForLoan: false,
            createdAt: "2024-04-20",
            status: "inactive",
            activeWomen: 2,
            inactiveWomen: 1,
            totalLoan: 2,
            activeLoan: 0,
            repaidLoan: 1,
            defaultLoan: 1,
            totalLoanAmount: 25000,
            repaymentRate: 55.0,
            lastActivity: "2024-05-25",
        },
        {
            id: "tc10",
            name: "Kakuri Cooperative",
            vendorId: "v010",
            vendorName: "Binta Microfinance Vendors",
            location: "Kakuri, Kaduna South",
            womenCount: 6,
            eligibleForLoan: true,
            createdAt: "2024-02-05",
            status: "active",
            activeWomen: 5,
            inactiveWomen: 1,
            totalLoan: 4,
            activeLoan: 2,
            repaidLoan: 2,
            defaultLoan: 0,
            totalLoanAmount: 80000,
            repaymentRate: 78.0,
            lastActivity: "2024-06-05",
        },
    ],

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
