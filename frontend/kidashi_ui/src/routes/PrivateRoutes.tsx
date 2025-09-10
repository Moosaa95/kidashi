import { useAppSelector } from "@/states/app/hooks"
import { Navigate, Outlet } from "react-router"

export default function PrivateRoutes() {
    // const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
    const isAuthenticated = true;
    // If user is not logged in, block access to protected routes
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
