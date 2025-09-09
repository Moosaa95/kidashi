import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import SidebarContent from "./SidebarContent"

export default function Sidebar() {
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${open ? "visible" : "invisible"}`}>
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
                <div
                    className={`fixed left-0 top-0 h-full w-72 bg-sidebar/95 border-r shadow-2xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="absolute right-4 top-4">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <SidebarContent pathname={location.pathname} navigate={navigate} />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-sidebar/95 border-r shadow-xl px-6 pb-6">
                    <SidebarContent pathname={location.pathname} navigate={navigate} />
                </div>
            </div>
        </>
    )
}
