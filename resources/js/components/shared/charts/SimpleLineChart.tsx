import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_STYLE, CHART_GRID_STROKE, CHART_PRIMARY } from './chartTheme';

interface SimpleLineChartProps<T extends Record<string, unknown>> {
    data: T[];
    xKey: Extract<keyof T, string>;
    yKey: Extract<keyof T, string>;
    valueFormatter?: (value: number) => string;
    color?: string;
}

export default function SimpleLineChart<T extends Record<string, unknown>>({ data, xKey, yKey, valueFormatter, color = CHART_PRIMARY }: SimpleLineChartProps<T>) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
                <XAxis dataKey={xKey} tick={CHART_AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={CHART_AXIS_STYLE} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                    formatter={(value: unknown) => (valueFormatter ? valueFormatter(Number(value)) : String(value))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 12 }}
                />
                <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}
