import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface AreaConfig {
    dataKey: string
    stroke: string
    fill: string
    fillOpacity?: number
    name?: string
    stackId?: string
    type?: "monotone" | "linear" | "step"
}

interface AreaChartProps {
    data: any[]
    areas: AreaConfig[]
    height?: number
    xAxisKey: string
    showGrid?: boolean
    showLegend?: boolean
}

export function AreaChart({
    data,
    areas,
    height = 300,
    xAxisKey,
    showGrid = true,
    showLegend = false
}: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                {showLegend && <Legend />}
                {areas.map((area, index) => (
                    <Area
                        key={index}
                        type={area.type || "monotone"}
                        dataKey={area.dataKey}
                        stackId={area.stackId}
                        stroke={area.stroke}
                        fill={area.fill}
                        fillOpacity={area.fillOpacity || 0.6}
                        name={area.name}
                    />
                ))}
            </RechartsAreaChart>
        </ResponsiveContainer>
    )
}
