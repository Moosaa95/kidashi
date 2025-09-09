import type { Alert, DashboardStats } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


interface DashboardState {
    stats: DashboardStats
    alerts: Alert[]
    loading: boolean
    error: string | null
}

const initialState: DashboardState = {
    stats: {
        totalVendors: 247,
        activeVendors: 198,
        pendingApplications: 23,
        totalCommunities: 1456,
        eligibleCommunities: 1203,
        totalWomen: 8934,
        activeWomen: 7821,
        totalLoansValue: 2450000,
        activeLoans: 1876,
        repaymentRate: 94.2,
        transactionVolume: 156780,
        fraudAlerts: 3,
    },
    alerts: [
        {
            id: "1",
            type: "fraud",
            severity: "high",
            title: "Suspicious Transaction Pattern",
            message: "Multiple failed deposits detected from vendor VEN-001",
            timestamp: new Date().toISOString(),
            acknowledged: false,
            relatedId: "VEN-001",
        },
        {
            id: "2",
            type: "system",
            severity: "medium",
            title: "System Maintenance",
            message: "Scheduled maintenance window tonight 2:00-4:00 AM",
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
        {
            id: "3",
            type: "loan",
            severity: "low",
            title: "Loan Application Pending",
            message: "5 new loan applications require review",
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
    ],
    loading: false,
    error: null,
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
            state.stats = { ...state.stats, ...action.payload }
        },
        acknowledgeAlert: (state, action: PayloadAction<string>) => {
            const alert = state.alerts.find((a) => a.id === action.payload)
            if (alert) {
                alert.acknowledged = true
            }
        },
        dismissAlert: (state, action: PayloadAction<string>) => {
            state.alerts = state.alerts.filter((a) => a.id !== action.payload)
        },
        addAlert: (state, action: PayloadAction<Alert>) => {
            state.alerts.unshift(action.payload)
        },
    },
})

export const { setLoading, setError, updateStats, acknowledgeAlert, dismissAlert, addAlert } = dashboardSlice.actions
export default dashboardSlice.reducer
