import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
    user?: {
        name: string
        email: string
        avatarUrl?: string
    }
    onLogout: () => void
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
    const [open, setOpen] = useState(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 focus:outline-none cursor-pointer">
                    <Avatar>
                        <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                        <AvatarFallback>
                            {user?.name ? user.name[0].toUpperCase() : "?"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                        {user?.name ?? "Guest"}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span className="font-medium">{user?.name ?? "Guest"}</span>
                        <span className="text-xs text-muted-foreground">
                            {user?.email ?? "Not signed in"}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setOpen(false)
                        onLogout()
                    }}
                    className="text-red-600"
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
