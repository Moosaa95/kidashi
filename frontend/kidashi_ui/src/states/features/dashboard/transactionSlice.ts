import type { Transaction } from "@/types/global"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"



interface TransactionsState {
    transactions: Transaction[]
    loading: boolean
    error: string | null
    filter: "all" | "pending" | "successful" | "failed"
    stats: {
        pending: number
        successful: number
        total: number
        failed: number
    }
}

const initialState: TransactionsState = {
    stats: {
        pending: 3,
        successful: 2,
        total: 15,
        failed: 10,
    },
    transactions: [
        {
            id: "TRX-001",
            account_name: "Amina Hayaha",
            account_number: "1290909099",
            description: "Dispute loan for wfi",
            amount: 150000,
            reference_number: "REF-0001",
            remarks: "Batch payout",
            charges: 500,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-01T10:00:00Z",
            status: "pending",
        },
        {
            id: "TRX-002",
            account_name: "Blessing",
            account_number: "ACCT-1002",
            description: "Loan payout to Blessing",
            amount: 250000,
            reference_number: "REF-0002",
            remarks: "Approved loan disbursement",
            charges: 750,
            transaction_type: "Disbursement",
            transaction_date: "2025-08-25T14:30:00Z",
            status: "successful",
        },
        {
            id: "TRX-003",
            account_name: "Khadija",
            account_number: "ACCT-1003",
            description: "Repayment from Khadija",
            amount: 50000,
            reference_number: "REF-0003",
            remarks: "Monthly repayment",
            charges: 0,
            transaction_type: "Repayment",
            transaction_date: "2025-08-30T09:15:00Z",
            status: "successful",
        },
        {
            id: "TRX-004",
            account_name: "Zainab",
            account_number: "ACCT-1004",
            description: "Refund to Zainab",
            amount: 20000,
            reference_number: "REF-0004",
            remarks: "Refund - duplicate charge",
            charges: 0,
            transaction_type: "Refund",
            transaction_date: "2025-09-02T11:45:00Z",
            status: "failed",
        },
        {
            id: "TRX-005",
            account_name: "Community A",
            account_number: "ACCT-1005",
            description: "Bulk disbursement - Community A",
            amount: 1200000,
            reference_number: "REF-0005",
            remarks: "Community loan batch",
            charges: 2500,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-03T16:00:00Z",
            status: "pending",
        },
        {
            id: "TRX-006",
            account_name: "Fatima Yusuf",
            account_number: "ACCT-1006",
            description: "Loan payout to Fatima",
            amount: 180000,
            reference_number: "REF-0006",
            remarks: "First loan disbursement",
            charges: 600,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-04T10:20:00Z",
            status: "successful",
        },
        {
            id: "TRX-007",
            account_name: "Musa Bello",
            account_number: "ACCT-1007",
            description: "Repayment from Musa",
            amount: 70000,
            reference_number: "REF-0007",
            remarks: "Monthly repayment",
            charges: 0,
            transaction_type: "Repayment",
            transaction_date: "2025-09-05T09:00:00Z",
            status: "successful",
        },
        {
            id: "TRX-008",
            account_name: "Aisha Umar",
            account_number: "ACCT-1008",
            description: "Refund to Aisha",
            amount: 30000,
            reference_number: "REF-0008",
            remarks: "Refund for failed transaction",
            charges: 0,
            transaction_type: "Refund",
            transaction_date: "2025-09-06T12:30:00Z",
            status: "failed",
        },
        {
            id: "TRX-009",
            account_name: "Group B",
            account_number: "ACCT-1009",
            description: "Bulk disbursement - Group B",
            amount: 900000,
            reference_number: "REF-0009",
            remarks: "Group loan batch",
            charges: 2000,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-07T15:45:00Z",
            status: "pending",
        },
        {
            id: "TRX-010",
            account_name: "Suleiman",
            account_number: "ACCT-1010",
            description: "Loan payout to Suleiman",
            amount: 220000,
            reference_number: "REF-0010",
            remarks: "Second loan disbursement",
            charges: 700,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-08T11:10:00Z",
            status: "successful",
        },
        {
            id: "TRX-011",
            account_name: "Maryam",
            account_number: "ACCT-1011",
            description: "Repayment from Maryam",
            amount: 60000,
            reference_number: "REF-0011",
            remarks: "Monthly repayment",
            charges: 0,
            transaction_type: "Repayment",
            transaction_date: "2025-09-09T08:50:00Z",
            status: "successful",
        },
        {
            id: "TRX-012",
            account_name: "Hassan",
            account_number: "ACCT-1012",
            description: "Refund to Hassan",
            amount: 25000,
            reference_number: "REF-0012",
            remarks: "Refund for overcharge",
            charges: 0,
            transaction_type: "Refund",
            transaction_date: "2025-09-10T13:40:00Z",
            status: "failed",
        },
        {
            id: "TRX-013",
            account_name: "Community C",
            account_number: "ACCT-1013",
            description: "Bulk disbursement - Community C",
            amount: 1100000,
            reference_number: "REF-0013",
            remarks: "Community loan batch",
            charges: 2300,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-11T17:30:00Z",
            status: "pending",
        },
        {
            id: "TRX-014",
            account_name: "Abubakar",
            account_number: "ACCT-1014",
            description: "Loan payout to Abubakar",
            amount: 200000,
            reference_number: "REF-0014",
            remarks: "Third loan disbursement",
            charges: 650,
            transaction_type: "Disbursement",
            transaction_date: "2025-09-12T10:05:00Z",
            status: "successful",
        },
        {
            id: "TRX-015",
            account_name: "Fatima Sani",
            account_number: "ACCT-1015",
            description: "Repayment from Fatima Sani",
            amount: 80000,
            reference_number: "REF-0015",
            remarks: "Monthly repayment",
            charges: 0,
            transaction_type: "Repayment",
            transaction_date: "2025-09-13T09:25:00Z",
            status: "successful",
        },
    ],
    loading: false,
    error: null,
    filter: "all",
}

const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        setFilter: (state, action: PayloadAction<TransactionsState["filter"]>) => {
            state.filter = action.payload
        },
    },
})

export const {
    setLoading,
    setError,
    setFilter,
} = transactionsSlice.actions

export default transactionsSlice.reducer
