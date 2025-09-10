import { type LucideIcon } from "lucide-react"

interface VendorInfoItemProps {
    icon: LucideIcon
    text: string
}

export function VendorInfoItem({ icon: Icon, text }: VendorInfoItemProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-primary" />
            <span>{text}</span>
        </div>
    )
}
