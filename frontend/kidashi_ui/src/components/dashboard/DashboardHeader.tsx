import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
    loading: boolean
    onRefresh: () => void
}

export default function DashboardHeader({ loading, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Monitor vendor applications, trust circles growth, and asset performance.
                </p>
            </div>
            <Button onClick={onRefresh} variant="outline" disabled={loading}>
                {loading ? "Loading..." : "Refresh Data"}
            </Button>
        </div>
    )
}
