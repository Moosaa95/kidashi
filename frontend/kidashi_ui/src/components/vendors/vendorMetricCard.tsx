interface VendorMetricsCardProps {
    value: string | number
    label: string
}

export function VendorMetricsCard({ value, label }: VendorMetricsCardProps) {
    return (
        <div className="text-center p-3 bg-accent rounded-lg">
            <div className="text-2xl font-bold text-primary">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
        </div>
    )
}
