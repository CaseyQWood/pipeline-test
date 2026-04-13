import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SimulationResult } from '../../types/simulation';

interface WoundChartProps {
  result: SimulationResult;
}

export function WoundChart({ result }: WoundChartProps) {
  const { distribution, median, p10, p90 } = result;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={distribution}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" />
        <XAxis
          dataKey="wounds"
          stroke="#9ca3af"
          fontSize={12}
          label={{ value: 'Wounds', position: 'insideBottom', offset: -2, fill: '#9ca3af', fontSize: 12 }}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          label={{ value: '%', position: 'insideLeft', offset: 10, fill: '#9ca3af', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #2e303a',
            borderRadius: '6px',
            color: '#f3f4f6',
            fontSize: '13px',
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Probability']}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => `${label} wounds`}
        />
        <ReferenceArea
          x1={p10}
          x2={p90}
          fill="#c9a84c"
          fillOpacity={0.1}
          stroke="#c9a84c"
          strokeOpacity={0.3}
          strokeDasharray="3 3"
        />
        <ReferenceLine
          x={median}
          stroke="#c9a84c"
          strokeWidth={2}
          label={{
            value: `Median: ${median}`,
            position: 'top',
            fill: '#c9a84c',
            fontSize: 12,
          }}
        />
        <Bar dataKey="percentage" radius={[2, 2, 0, 0]}>
          {distribution.map((entry) => (
            <Cell
              key={entry.wounds}
              fill={
                entry.wounds >= p10 && entry.wounds <= p90
                  ? '#8b0000'
                  : '#4a1a1a'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
