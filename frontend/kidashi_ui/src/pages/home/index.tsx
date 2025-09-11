import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { dismissAlert } from "@/states/features/dashboard/dashboardSlice"
import { setFilter } from "@/states/features/dashboard/vendorSlice"

import DashboardHeader from "@/components/dashboard/DashboardHeader"
import RecentApplications from "@/components/dashboard/RecentApplications"
import SystemAlerts from "@/components/dashboard/SystemAlerts"
import QuickActions from "@/components/dashboard/QuickActions"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"

export default function DashboardOverview() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { stats, alerts, loading } = useAppSelector((state) => state.dashboard)
  const { vendors } = useAppSelector((state) => state.vendors)



  const statsData: StatProps[] = [
    {
      name: "Total Vendors",
      value: stats.totalVendors.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: "Building2",
    },
    {
      name: "Active Communities",
      value: stats.totalCommunities.toLocaleString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: "Users",
    },
    {
      name: "Total Loans Disbursed",
      value: `₦${(stats.totalLoansValue / 1_000_000).toFixed(1)}M`,
      change: "+23%",
      changeType: "positive" as const,
      icon: "CreditCard",
    },
    {
      name: "Repayment Rate",
      value: `${stats.repaymentRate}%`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: "TrendingUp",
    },
    {
      name: "Total Women",
      value: `${stats.totalWomen}`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: "PersonStanding",
    },
  ]


  const recentApplications = vendors
    .filter((v) => v.status === "pending" || v.status === "approved")
    .slice(0, 3)
    .map((vendor) => ({
      id: vendor.id,
      vendorName: vendor.name,
      location: vendor.location,
      status: vendor.status,
      submittedAt: new Date(vendor.applicationDate).toLocaleDateString(),
      guarantors: 2,
    }))


  // handlers
  const handleReviewApplication = (id: string, name: string) => {
    dispatch(setFilter("pending"))
    console.log(name);

    navigate(`/dashboard/vendors/${id}`)
  }

  const handleDismissAlert = (id: string) => {
    dispatch(dismissAlert(id))
  }

  const handleQuickAction = (route: string) => {
    navigate(route)
  }

  return (
    <div className="space-y-8">
      <DashboardHeader loading={loading} onRefresh={() => window.location.reload()} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplications
          applications={recentApplications}
          onReview={handleReviewApplication}
          onViewAll={() => navigate("/vendors")}
        />
        <SystemAlerts
          alerts={alerts}
          onDismiss={handleDismissAlert}
          onViewAll={() => console.log("open all alerts")}
        />
      </div>

      <QuickActions onAction={handleQuickAction} />
    </div>
  )

}
