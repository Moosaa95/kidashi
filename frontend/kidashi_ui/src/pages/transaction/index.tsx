import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard, { type StatProps } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/datatable";
import { useAppDispatch, useAppSelector } from "@/states/app/hooks";
import { setFilter } from "@/states/features/dashboard/transactionSlice";
import { transactionColumns } from "@/components/transactions/transactionColumns";
import type { Transaction } from "@/types/global";


export default function TransactionManagement() {
    const [searchQuery] = useState("")
    // local selection not used currently
    const [searchParams] = useSearchParams()

    const dispatch = useAppDispatch()
    const { transactions, loading, filter, stats } = useAppSelector(state => state.transactions)

    const statsData: StatProps[] = [
        {
            name: "Total no. of Transactions",
            value: String(stats.total ?? 0),
            change: "",
            changeType: "positive" as const,
            icon: "Clock",
            description: "Total transactions"
        },
        {
            name: "Successful Transactions",
            value: `₦${(stats.successful || 0).toLocaleString()}`,
            change: "",
            changeType: "positive" as const,
            icon: "CheckCircle",
            description: "Sum of transaction amounts"
        },
        {
            name: "Pending Transactions",
            value: String(stats.pending ?? 0),
            change: "",
            changeType: "negative" as const,
            icon: "Building2",
        },
        {
            name: "Failed Transactions",
            value: String(stats.failed ?? 0),
            change: "+0.8%",
            changeType: "positive" as const,
            icon: "TrendingUp",
        },
    ]

    const filtered = transactions.filter((transaction: Transaction) => {
        const name = (transaction.account_number || transaction.account_name).toLowerCase()
        const matchesSearch = name.includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || transaction.status === filter
        return matchesSearch && matchesFilter
    })

    useEffect(() => {
        const reviewId = searchParams.get("review")
        void reviewId
    }, [searchParams, transactions])





    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Transaction Monitoring</h1>
                    <p className="text-muted-foreground mt-2">
                        Review transactions, manage statuses, and monitor performance metrics.
                    </p>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
                {statsData.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>

            <Tabs className="space-y-4" value={filter} defaultValue="all" onValueChange={(val) => dispatch(setFilter(val as unknown as 'all' | 'pending' | 'successful' | 'failed'))}>
                <TabsList className="grid w-full grid-cols-3 gap-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="pending">Pending</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="failed">Failed</TabsTrigger>
                </TabsList>
                <TabsContent value={filter}>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading transactions...</p>
                    ) : (
                        <DataTable columns={transactionColumns} data={filtered} searchColumn="name" searchPlaceholder="search transactions" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
