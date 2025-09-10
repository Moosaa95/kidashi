import { Route, Routes } from "react-router"
import Register from "./auth/register"
import Login from "./auth/login"
import { PrivateRoutes, PublicRoutes } from "./routes"
import { AdminDashboardLayout } from "./layout"
import { AnalyticsDashboard, DashboardOverview, TransactionManagement, VendorDetail, VendorManagement, VendorRequest, WomenDetail, WomenManagement } from "./pages"
import TrustCircle from "./pages/trust-circle"
import TrustDetail from "./pages/trust-circle/detail"


export default function AppRouter() {
    return (
        <Routes>
            {/* public routes */}
            <Route element={<PublicRoutes />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* private routes */}
            <Route path="/dashboard" element={<PrivateRoutes />}>
                <Route element={<AdminDashboardLayout />}>
                    <Route path="" element={<DashboardOverview />} />
                    <Route path="vendors">
                        <Route path="list" element={<VendorManagement />} />
                        <Route path=":id" element={<VendorDetail />} />
                    </Route>
                    <Route path="trust-circles">
                        <Route path="list" element={<TrustCircle />} />
                        <Route path=":id" element={<TrustDetail />} />
                    </Route>
                    <Route path="women">
                        <Route path="list" element={<WomenManagement />} />
                        <Route path=":id" element={<WomenDetail />} />
                    </Route>
                    <Route path="transactions">
                        <Route path="list" element={<TransactionManagement />} />
                    </Route>
                    <Route path="requests">
                        <Route path="list" element={<VendorRequest />} />
                    </Route>
                    <Route path="analytics">
                        <Route path="list" element={<AnalyticsDashboard />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    )
}