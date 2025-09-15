import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts"

interface PieChartProps {
    data: any[]
    dataKey: string
    nameKey: string
    height?: number
    outerRadius?: number
    showLabels?: boolean
    showLegend?: boolean
    colorKey?: string
    customColors?: string[]
    labelFormatter?: (entry: any) => string
}

export function PieChart({
    data,
    dataKey,
    nameKey,
    height = 300,
    outerRadius = 80,
    showLabels = true,
    showLegend = false,
    colorKey = "color",
    customColors = ["#15803d", "#84cc16", "#f97316", "#d97706", "#ea580c"],
    labelFormatter
}: PieChartProps) {
    const getColor = (entry: any, index: number) => {
        return entry[colorKey] || customColors[index % customColors.length]
    }

    const defaultLabelFormatter = (entry: any) => `${entry[nameKey]}: ${entry.percentage || ''}%`

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    dataKey={dataKey}
                    label={showLabels ? (labelFormatter || defaultLabelFormatter) : false}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                    ))}
                </Pie>
                <Tooltip />
                {showLegend && <Legend />}
            </RechartsPieChart>
        </ResponsiveContainer>
    )
}
