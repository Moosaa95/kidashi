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
            id: "d9d9a3e5-fdab-4837-aa12-d02bd93e87a6",
            first_name: "Abdullahi",
            surname: "Musa",
            email: "Moosaabdullahi45@gmail.com",
            phone: "07052869461",
            location: "Olukoye street opp Stamford hotel",
            status: "PENDING",
            business_type: "MANUFACTURING",
            business_address: "Olukoye street opp Stamford hotel",
            business_description: "I sell clothes and fashion accessories",
            application_date: "2023-10-01T10:00:00Z",
            guarantor_name: "Nunez",
            guarantor_phone: "07052869461",
            trust_circles_count: 0,
            total_women: 0,
            repayment_rate: 0,
            documents: ["id_card.pdf", "guarantor_form.pdf"],
        },
        {
            id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            first_name: "Jane",
            surname: "Doe",
            email: "janedoe@example.com",
            phone: "07012345678",
            location: "123 Main St, Lagos",
            status: "APPROVED",
            application_date: "2023-09-15T10:00:00Z",
            business_type: "RETAIL",
            business_address: "123 Main St, Lagos",
            business_description: "I run a retail store",
            guarantor_name: "John Doe",
            guarantor_phone: "07087654321",
            trust_circles_count: 1,
            total_women: 5,
            repayment_rate: 95,
            documents: ["id_card.pdf", "business_license.pdf"],
        },
        {
            id: "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
            first_name: "Mary",
            surname: "Smith",
            email: "marysmith@example.com",
            phone: "07012345678",
            location: "456 Elm St, Lagos",
            status: "SUSPENDED",
            business_type: "SERVICES",
            business_address: "456 Elm St, Lagos",
            business_description: "I provide consulting services",
            application_date: "2023-09-20T10:00:00Z",
            guarantor_name: "Jane Smith",
            guarantor_phone: "07087654321",
            trust_circles_count: 2,
            total_women: 10,
            repayment_rate: 90,
            documents: ["id_card.pdf", "business_license.pdf"],
        },
        {
            id: "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
            first_name: "Alice",
            surname: "Johnson",
            email: "alicejohnson@example.com",
            phone: "07012345678",
            location: "789 Pine St, Lagos",
            status: "REJECTED",
            business_type: "RETAIL",
            business_address: "789 Pine St, Lagos",
            business_description: "I run a retail store",
            application_date: "2023-09-25T10:00:00Z",
            guarantor_name: "John Johnson",
            guarantor_phone: "07087654321",
            trust_circles_count: 1,
            total_women: 5,
            repayment_rate: 95,
            documents: ["id_card.pdf", "business_license.pdf"],
        }
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
