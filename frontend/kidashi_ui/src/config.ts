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
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Vendor Management", href: "/vendors/list", icon: Building2 },
    { name: "Trust Circles Management", href: "/trust-circles/list", icon: Users },
    { name: "Women Management", href: "/women/list", icon: Users },
    { name: "Loan Overview", href: "/loans", icon: CreditCard },
    { name: "Transaction Monitoring", href: "/transactions/list", icon: TrendingUp },
    { name: "Communication Center", href: "/communications", icon: MessageSquare },
    { name: "Analytics Dashboard", href: "/analytics/list", icon: BarChart3 },
    { name: "Staff Management", href: "/staff", icon: Users },
]
