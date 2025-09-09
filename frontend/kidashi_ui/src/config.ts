import {
    Home,
    Building2,
    Users,
    CreditCard,
    TrendingUp,
    MessageSquare,
    BarChart3,
} from "lucide-react"



export const config = {
    apiUrl: import.meta.env.VITE_API_URL as string,
};


export const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Vendor Management", href: "/dashboard/vendors/list", icon: Building2 },
    { name: "Trust Circles Management", href: "/dashboard/trust-circles/list", icon: Users },
    { name: "Women Management", href: "/dashboard/women/list", icon: Users },
    { name: "Loan Oversight", href: "/dashboard/loans", icon: CreditCard },
    { name: "Transaction Monitoring", href: "/dashboard/transactions/list", icon: TrendingUp },
    // { name: "Requests", href: "/dashboard/requests/list", icon: TrendingUp },
    { name: "Communication Center", href: "/dashboard/communications", icon: MessageSquare },
    { name: "Analytics Dashboard", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Staff Management", href: "/dashboard/staff", icon: Users },
]
