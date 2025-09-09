import type { Vendor } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


interface VendorsState {
    vendors: Vendor[]
    loading: boolean
    error: string | null
    filter: "all" | "pending" | "approved" | "rejected" | "suspended"
    stats: {
        pendingApplications: number
        activeVendors: number
        totalTrustCircles: number
        averageRepaymentRate: number
    }
    requests: {
        total_requests: number
        pending_requests: number
        approved_requests: number
    }
}

const initialState: VendorsState = {
    stats: {
        pendingApplications: 23,
        activeVendors: 198,
        totalTrustCircles: 1456,
        averageRepaymentRate: 94.2,
    },
    requests: {
        total_requests: 30,
        pending_requests: 15,
        approved_requests: 15
    },
    vendors: [
        {
            id: "VEN-001",
            name: "Sarah Okonkwo",
            email: "sarah.okonkwo@email.com",
            phone: "+234 801 234 5678",
            location: "Lagos, Nigeria",
            status: "pending",
            applicationDate: "2024-12-15",
            businessType: "Provision Sellet",
            guarantorName: "John Okonkwo",
            guarantorPhone: "+234 802 345 6789",
            trustCirclesCount: 0,
            totalWomen: 0,
            repaymentRate: 0,
            documents: ["id_card.pdf", "guarantor_form.pdf"],
        },
        {
            id: "VEN-002",
            name: "Amina Hassan",
            email: "amina.hassan@email.com",
            phone: "+234 803 456 7890",
            location: "Kano, Nigeria",
            status: "approved",
            applicationDate: "2024-11-20",
            businessType: "Farm Profucts Seller",
            guarantorName: "Ibrahim Hassan",
            guarantorPhone: "+234 804 567 8901",
            trustCirclesCount: 3,
            totalWomen: 45,
            repaymentRate: 96.8,
            documents: ["id_card.pdf", "guarantor_form.pdf", "business_license.pdf"],
        },
    ],
    loading: false,
    error: null,
    filter: "all",
}

const vendorsSlice = createSlice({
    name: "vendors",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        setFilter: (state, action: PayloadAction<VendorsState["filter"]>) => {
            state.filter = action.payload
        },
        updateVendorStatus: (state, action: PayloadAction<{ id: string; status: Vendor["status"] }>) => {
            const vendor = state.vendors.find((v) => v.id === action.payload.id)
            if (vendor) {
                vendor.status = action.payload.status
            }
        },
        addVendor: (state, action: PayloadAction<Vendor>) => {
            state.vendors.push(action.payload)
        },
    },
})

export const { setLoading, setError, setFilter, updateVendorStatus, addVendor } = vendorsSlice.actions
export default vendorsSlice.reducer
