import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as Icons from "lucide-react"

type ChangeType = "positive" | "negative"

export interface StatProps {
    name: string
    value: string
    change?: string
    changeType?: ChangeType
    icon: string
    description?: string
}

export default function StatCard({ name, value, change = "", changeType = "positive", icon, description = "last month" }: StatProps) {
    const IconComponent = Icons[icon as keyof typeof Icons] as Icons.LucideIcon

    const Icon = IconComponent || Icons.AlertCircle

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{name}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground">
                    <span
                        className={`font-medium ${changeType === "positive" ? "text-primary" : "text-destructive"
                            }`}
                    >
                        {change}
                    </span>{" "}
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
