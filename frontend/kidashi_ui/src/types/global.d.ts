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
    nin?: string | null
    gender?: string | null
    dob?: string | null
    nationality?: string | null
    geo_region?: string | null
    state?: string | null
    state_id?: string | null
    lga?: string | null
    lga_id?: string | null
    country?: string | null
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
    circle_name: string
    can_accept_new_members_by_voting: boolean
    can_add_more_members: boolean
    is_full: boolean
    get_active_members: number
    total_asset_amount: number
    vendor_id: string
    vendor__first_name: string
    vendor__surname: string
    location: string
    max_members: number
    loan_eligibility: "ELIGIBLE" | "NOT_ELIGIBLE" | "UNDER_REVIEW"
    created_at: string
    status: "active" | "inactive"
    current_members_count: number
    current_member_count?: number
}


export interface WomanSummary {
    id: string
    first_name: string
    surname: string
    other_name?: string | null
    mobile_number: string
    account_number?: string | null
    maximum_balance?: string | number | null
    tier?: string | null
    email?: string | null
    dob?: string | null
    nationality?: string | null
    occupation?: string | null
    annual_income?: string | null
    employment_type?: string | null
    image?: string | null
    residential_address?: string | null
    stage?: string | null
    nin?: string | null
    bvn?: string | null
    cba_customer_id?: string | null
    repayment_status?: string | null
    status?: string | null
    vendor?: string | null
    trust_circle?: string | null
    geo_region?: string | null
    state?: string | null
    lga?: string | null
    country?: string | null
}

export interface WomanDetail {
    id: string
    first_name: string
    surname: string
    other_name: string | null
    mobile_number: string
    account_number: string | null
    maximum_balance: string | null
    tier: string | null
    email: string | null
    dob: string | null
    nationality: string | null
    occupation: string | null
    annual_income: string | null
    employment_type: string | null
    image: string | null
    residential_address: string | null
    stage: string | null
    nin: string | null
    bvn: string | null
    cba_customer_id: string | null
    repayment_status: string | null
    status: string | null
    vendor_id: string | null
    trust_circle_id: string | null
    geo_region: string | null
    state: string | null
    lga: string | null
    country: string | null
    created_at?: string | null
    vendor__first_name?: string | null
    vendor__surname?: string | null
    trust_circle__circle_name?: string | null
}

export interface WomanFilters {
    search?: string
    status?: string
    vendor_id?: string
    trust_circle_id?: string
}


export interface Asset {
    id: string
    name?: string | null
    value: number
    markup: number
    status: "REQUESTED" | "QUERIED" | "APPROVED" | "REJECTED" | "FAILED" | "CLOSED" | "RUNNING"
    loan_id?: string | null
    product_code?: string | null
    created_at: string
    reject_reason?: string | null
    items_requested?: any[]
    woman_id?: string
    woman__first_name?: string
    woman__surname?: string
    woman__trust_circle__circle_name?: string
    vendor__id?: string
    vendor__first_name?: string
    vendor__surname?: string
    vendor__business_type?: string
    vendor__business_description?: string
    vendor__phone?: string
    vendor__community?: string
}

export interface AssetFilters {
    status?: string
    woman_id?: string
    vendor_id?: string
    loan_id?: string
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
