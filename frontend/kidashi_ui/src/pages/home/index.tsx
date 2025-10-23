import { useNavigate } from "react-router"
import { useAppDispatch } from "@/states/app/hooks"
// import { dismissAlert } from "@/states/features/dashboard/dashboardSlice"
import { setFilter } from "@/states/features/dashboard/vendorSlice"

import DashboardHeader from "@/components/dashboard/DashboardHeader"
import RecentApplications from "@/components/dashboard/RecentApplications"
// import SystemAlerts from "@/components/dashboard/SystemAlerts"
// import QuickActions from "@/components/dashboard/QuickActions"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"
import { useGetDashboardMetricsQuery, useGetPendingVendorsQuery } from "@/states/api/endpoints/dashboard/dashboardApiSlice"

export default function DashboardOverview() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: metricsData, isLoading: metricsLoading, refetch } = useGetDashboardMetricsQuery()
  const { data: pendingVendorsData } = useGetPendingVendorsQuery({
    filters: { status: "PENDING" }
  })

  console.log("this is vendors data", pendingVendorsData);


  const statsData: StatProps[] = [
    {
      name: "Total Vendors",
      value: (metricsData?.data?.vendors?.total_vendors || 0).toLocaleString(),
      change: `${metricsData?.data?.vendors?.active_vendors || 0} active`,
      changeType: "positive" as const,
      icon: "Building2",
    },
    {
      name: "Active Circles",
      value: (metricsData?.data?.trust_circles?.active_circles || 0).toLocaleString(),
      change: `${metricsData?.data?.trust_circles?.eligible_circles || 0} eligible`,
      changeType: "positive" as const,
      icon: "Users",
    },
    {
      name: "Total Loans Disbursed",
      value: `₦${((metricsData?.data?.assets?.total_value_disbursed || 0) / 1_000_000).toFixed(2)}M`,
      change: `${metricsData?.data?.assets?.total_loans || 0} loans`,
      changeType: "positive" as const,
      icon: "CreditCard",
    },
    {
      name: "Total Women",
      value: `${metricsData?.data?.women?.total_women || 0}`,
      change: `${metricsData?.data?.women?.active_women || 0} active`,
      changeType: "positive" as const,
      icon: "PersonStanding",
    },
  ]

  const vendors = pendingVendorsData?.data || []
  console.log("vendors list", vendors);
  const recentApplications = vendors
    .slice(0, 3)
    .map((vendor: any) => ({
      id: vendor.id,
      vendorName: vendor.first_name,
      location: vendor.location,
      status: vendor.status,
      submittedAt: new Date(vendor.created_at).toLocaleDateString(),
      guarantors: 2,
    }))


  // handlers
  const handleReviewApplication = (id: string, name: string) => {
    dispatch(setFilter("pending"))
    console.log(name);

    navigate(`/vendors/${id}`)
  }

  // const handleDismissAlert = (id: string) => {
  //   dispatch(dismissAlert(id))
  // }

  // const handleQuickAction = (route: string) => {
  //   navigate(route)
  // }

  return (
    <div className="space-y-8">
      <DashboardHeader loading={metricsLoading} onRefresh={() => refetch()} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <RecentApplications
          applications={recentApplications}
          onReview={handleReviewApplication}
          onViewAll={() => navigate("/vendors/list")}
        />
        {/* <SystemAlerts
          alerts={alerts}
          onDismiss={handleDismissAlert}
          onViewAll={() => console.log("open all alerts")}
        /> */}
      </div>

      {/* <QuickActions onAction={handleQuickAction} /> */}
    </div>
  )

}
