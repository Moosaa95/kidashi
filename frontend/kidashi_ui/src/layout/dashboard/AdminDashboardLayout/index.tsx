
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { Outlet } from "react-router"

export default function AdminDashboardLayout() {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            <Sidebar />
            <div className="lg:pl-72">
                <Topbar />
                <main className="py-8 animate-slide-up">
                    <div className="px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
