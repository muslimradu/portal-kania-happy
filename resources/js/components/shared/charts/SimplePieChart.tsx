import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from './chartTheme';

interface SimplePieChartProps {
    data: Array<{ name: string; value: number }>;
    valueFormatter?: (value: number) => string;
    colors?: string[];
}

export default function SimplePieChart({ data, valueFormatter, colors = CHART_COLORS }: SimplePieChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: unknown) => (valueFormatter ? valueFormatter(Number(value)) : String(value))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 12 }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
