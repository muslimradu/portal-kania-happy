import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_STYLE, CHART_GRID_STROKE, CHART_PRIMARY } from './chartTheme';

interface SimpleBarChartProps<T extends Record<string, unknown>> {
    data: T[];
    xKey: Extract<keyof T, string>;
    yKey: Extract<keyof T, string>;
    valueFormatter?: (value: number) => string;
    color?: string;
}

export default function SimpleBarChart<T extends Record<string, unknown>>({ data, xKey, yKey, valueFormatter, color = CHART_PRIMARY }: SimpleBarChartProps<T>) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
                <XAxis dataKey={xKey} tick={CHART_AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={CHART_AXIS_STYLE} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                    formatter={(value: unknown) => (valueFormatter ? valueFormatter(Number(value)) : String(value))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 12 }}
                />
                <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
        </ResponsiveContainer>
    );
}
