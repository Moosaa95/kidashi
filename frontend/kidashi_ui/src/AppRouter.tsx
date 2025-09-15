import { Route, Routes } from "react-router"
import Register from "./auth/register"
import Login from "./auth/login"
import { PrivateRoutes, PublicRoutes } from "./routes"
import { AdminDashboardLayout } from "./layout"
import { AnalyticsDashboard, CommunicationCenter, DashboardOverview, TransactionManagement, TrustCircleDetail, TrustCircles, VendorDetail, VendorManagement, WomenDetail, WomenManagement } from "./pages"


export default function AppRouter() {
    return (
        <Routes>
            {/* public routes */}
            <Route element={<PublicRoutes />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* private routes */}
            <Route path="" element={<PrivateRoutes />}>
                <Route element={<AdminDashboardLayout />}>
                    <Route path="" element={<DashboardOverview />} />
                    <Route path="vendors">
                        <Route path="list" element={<VendorManagement />} />
                        <Route path=":id" element={<VendorDetail />} />
                    </Route>
                    <Route path="trust-circles">
                        <Route path="list" element={<TrustCircles />} />
                        <Route path=":id" element={<TrustCircleDetail />} />
                    </Route>
                    <Route path="women">
                        <Route path="list" element={<WomenManagement />} />
                        <Route path=":id" element={<WomenDetail />} />
                    </Route>
                    <Route path="transactions">
                        <Route path="list" element={<TransactionManagement />} />
                    </Route>
                    <Route path="communications">
                        <Route path="" element={<CommunicationCenter />} />
                    </Route>
                    <Route path="analytics">
                        <Route path="list" element={<AnalyticsDashboard />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    )
}
