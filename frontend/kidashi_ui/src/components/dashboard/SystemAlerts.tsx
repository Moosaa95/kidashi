import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, X } from "lucide-react"

interface Alert {
    id: string
    type: string
    message: string
    timestamp: string
}

interface SystemAlertsProps {
    alerts: Alert[]
    onDismiss: (id: string) => void
    onViewAll: () => void
}

export default function SystemAlerts({ alerts, onDismiss, onViewAll }: SystemAlertsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    System Alerts
                    {alerts.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                            {alerts.length}
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>Important notifications and system updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p>All alerts cleared!</p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div
                                className={`mt-0.5 h-2 w-2 rounded-full ${alert.type === "fraud"
                                        ? "bg-destructive"
                                        : alert.type === "loan"
                                            ? "bg-primary"
                                            : "bg-accent"
                                    }`}
                            />
                            <div className="flex-1">
                                <p className="text-sm">{alert.message}</p>
                                <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => onDismiss(alert.id)} className="h-6 w-6 p-0">
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))
                )}
                <Button className="w-full" variant="outline" onClick={onViewAll}>
                    View All Alerts
                </Button>
            </CardContent>
        </Card>
    )
}
