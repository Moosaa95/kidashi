import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, CreditCard, Banknote } from "lucide-react"

interface QuickActionsProps {
    onAction: (route: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
    const actions = [
        { label: "Review Vendors", icon: Building2, route: "/vendors" },
        { label: "Manage Communities", icon: Users, route: "/communities" },
        { label: "Process Loans", icon: CreditCard, route: "/loans" },
        { label: "View Transactions", icon: Banknote, route: "/transactions" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {actions.map(({ label, icon: Icon, route }) => (
                        <Button
                            key={label}
                            className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            variant="outline"
                            onClick={() => onAction(route)}
                        >
                            <Icon className="h-6 w-6" />
                            {label}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
