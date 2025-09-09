// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import * as Icons from "lucide-react"

// type ChangeType = "positive" | "negative"

// export interface Stat {
//     name: string
//     value: string
//     change: string
//     changeType: ChangeType
//     icon: keyof typeof Icons
// }

// interface StatsGridProps {
//     stats: Stat[]
// }

// export default function StatsGrid({ stats }: StatsGridProps) {
//     return (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
//             {stats.map((stat) => {
//                 const Icon = Icons[stat.icon] as Icons.LucideIcon
//                 return (
//                     <Card key={stat.name} className="hover:shadow-md transition-shadow cursor-pointer">
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
//                             <Icon className="h-4 w-4 text-primary" />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold text-foreground">{stat.value}</div>
//                             <p className="text-xs text-muted-foreground">
//                                 <span
//                                     className={`font-medium ${stat.changeType === "positive" ? "text-primary" : "text-destructive"
//                                         }`}
//                                 >
//                                     {stat.change}
//                                 </span>{" "}
//                                 from last month
//                             </p>
//                         </CardContent>
//                     </Card>
//                 )
//             })}
//         </div>
//     )
// }


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as Icons from "lucide-react"

type ChangeType = "positive" | "negative"

export interface StatProps {
    name: string
    value: string
    change?: string
    changeType?: ChangeType
    icon: keyof typeof Icons
    description?: string
}

export default function StatCard({ name, value, change = "", changeType = "positive", icon, description = "last month" }: StatProps) {
    const Icon = Icons[icon] as Icons.LucideIcon

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
