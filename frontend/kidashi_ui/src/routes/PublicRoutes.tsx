import { useAppSelector } from "@/states/app/hooks"
import { Navigate, Outlet } from "react-router"

export default function PublicRoutes() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)

  // If user is already logged in, block access to login/register
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
