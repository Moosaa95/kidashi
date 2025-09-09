export interface DashboardStats {
    totalVendors: number
    activeVendors: number
    pendingApplications: number
    totalCommunities: number
    eligibleCommunities: number
    totalWomen: number
    activeWomen: number
    totalLoansValue: number
    activeLoans: number
    repaymentRate: number
    transactionVolume: number
    fraudAlerts: number
}


export interface Message {
    id: string
    type: "broadcast" | "community" | "individual" | "vendor"
    title: string
    content: string
    channel: "sms" | "ussd" | "app" | "voice"
    recipients: number
    delivered: number
    read: number
    status: "draft" | "sending" | "sent" | "failed"
    createdAt: string
    scheduledAt?: string
}

export interface Alert {
    id: string
    type: "fraud" | "system" | "loan" | "vendor"
    severity: "low" | "medium" | "high" | "critical"
    title: string
    message: string
    timestamp: string
    acknowledged: boolean
    relatedId?: string
}

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended"

export interface Vendor {
    id: string
    name: string
    email: string
    phone: string
    location: string
    status: VendorStatus
    applicationDate: string
    businessType: string
    guarantorName: string
    guarantorPhone: string
    trustCirclesCount: number
    totalWomen: number
    repaymentRate: number
    documents: string[]
}


export interface TrustCircles {
    id: string
    name: string
    vendorId: string
    vendorName: string
    location: string
    womenCount: number
    eligibleForLoan: boolean
    createdAt: string
    status: "active" | "inactive"
    activeWomen: number
    inactiveWomen: number
    totalLoan: number
    activeLoan: number
    repaidLoan: number
    defaultLoan: number
    totalLoanAmount: number
    repaymentRate: number
    lastActivity: string
}


export interface WomenMember {
    id: string
    circleId: string
    vendorId: string
    name: string
    phone: string
    loanAmount: number
    repaymentStatus: "current" | "repaid" | "overdue" | "defaulted"
    joinDate: string
}


export interface Transaction {
    id: string
    account_name: string
    account_number?: string
    description?: string
    amount?: number
    reference_number?: string
    remarks?: string
    charges?: number
    transaction_type?: string
    transaction_date?: string
    status?: string
}