import { useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import UserMenu from "./UserMenu"

export default function Topbar() {
    const [search, setSearch] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Searching for:", search)
    }

    return (
        <div className="sticky justify-between top-0 z-40 flex h-20 items-center border-b bg-background/80 backdrop-blur-xl px-6 lg:px-8">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => console.log("Open sidebar")}>
                <Menu className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearch} className="relative flex flex-1 max-w-md items-center">
                <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search vendors, communities..."
                    className="pl-12 h-11 rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </form>

            <div className="flex items-center gap-x-4">
                <Button variant="ghost" size="sm" className="relative h-11 w-11 rounded-xl cursor-pointer">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary">3</Badge>
                </Button>
                <UserMenu user={{ name: "Hadiza Isah", email: "hadiza@example.com" }}
                    onLogout={() => console.log("User logged out")} />
            </div>
        </div>
    )
}
