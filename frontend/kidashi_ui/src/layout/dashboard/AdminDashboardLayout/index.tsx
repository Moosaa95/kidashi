
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { Outlet } from "react-router"

export default function AdminDashboardLayout() {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden lg:pl-72">
                <Topbar />
                <main className="flex-1 overflow-y-auto py-8 animate-slide-up">
                    <div className="px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
