import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface BarConfig {
    dataKey: string
    fill: string
    name?: string
    yAxisId?: string
}

interface BarChartProps {
    data: any[]
    bars: BarConfig[]
    height?: number
    xAxisKey: string
    showGrid?: boolean
    showLegend?: boolean
    xAxisProps?: {
        angle?: number
        textAnchor?: string
        height?: number
    }
    yAxes?: {
        left?: boolean
        right?: boolean
    }
}

export function BarChart({
    data,
    bars,
    height = 300,
    xAxisKey,
    showGrid = true,
    showLegend = false,
    xAxisProps = {},
    yAxes = { left: true }
}: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis
                    dataKey={xAxisKey}
                    angle={xAxisProps.angle}
                    textAnchor={xAxisProps.textAnchor}
                    height={xAxisProps.height}
                />
                {yAxes.left && <YAxis yAxisId="left" />}
                {yAxes.right && <YAxis yAxisId="right" orientation="right" />}
                <Tooltip />
                {showLegend && <Legend />}
                {bars.map((bar, index) => (
                    <Bar
                        key={index}
                        yAxisId={bar.yAxisId || "left"}
                        dataKey={bar.dataKey}
                        fill={bar.fill}
                        name={bar.name}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    )
}
