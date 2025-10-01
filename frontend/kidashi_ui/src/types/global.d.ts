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

export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export interface Vendor {
    id: string
    first_name: string
    surname: string
    other_names?: string
    community?: string
    email: string
    phone: string
    location: string
    status: VendorStatus
    application_date: string
    business_type: string
    business_description: string
    business_address: string
    guarantor_name: string
    guarantor_phone: string
    trust_circles_count: number
    total_women: number
    repayment_rate: number
    documents: string[]
}

export interface VendorGuarantor {
    id: string
    first_name: string
    surname: string
    other_name?: string | null
    phone?: string | null
    relationship?: string | null
    email?: string | null
    verification_status?: string | null
}

export interface VendorDetail {
    id: string
    first_name: string
    surname: string
    other_name?: string | null
    phone: string
    email?: string | null
    business_name?: string | null
    business_type: string
    business_description?: string | null
    address: string
    community?: string | null
    items_sold?: string[]
    status: VendorStatus | string
    cba_customer_id: string
    geo_region?: string | null
    state?: string | null
    lga?: string | null
    country?: string | null
    active_trust_circles_count?: number
    total_women_onboarded?: number
    created_at?: string
    updated_at?: string | null
    guarantors?: VendorGuarantor[]
    repayment_rate?: number
    repaymentRate?: number
    profile_image?: string | null
    profileImage?: string | null
    trustCircles?: any[]
    trust_circles?: any[]
    womenMembers?: any[]
    women_members?: any[]
    documents?: any[]
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
