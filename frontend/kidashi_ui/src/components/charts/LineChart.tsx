import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface LineConfig {
    dataKey: string
    stroke: string
    strokeWidth?: number
    name?: string
    type?: "monotone" | "linear" | "step"
}

interface LineChartProps {
    data: any[]
    lines: LineConfig[]
    height?: number
    xAxisKey: string
    showGrid?: boolean
    showLegend?: boolean
}

export function LineChart({
    data,
    lines,
    height = 300,
    xAxisKey,
    showGrid = true,
    showLegend = false
}: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                {showLegend && <Legend />}
                {lines.map((line, index) => (
                    <Line
                        key={index}
                        type={line.type || "monotone"}
                        dataKey={line.dataKey}
                        stroke={line.stroke}
                        strokeWidth={line.strokeWidth || 2}
                        name={line.name}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    )
}
