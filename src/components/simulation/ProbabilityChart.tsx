import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { OutcomeDistribution } from '@/types/types';

interface ProbabilityChartProps {
  distribution: OutcomeDistribution;
  title: string;
  color?: string;
}

export default function ProbabilityChart({ 
  distribution, 
  title,
  color = 'hsl(var(--chart-1))'
}: ProbabilityChartProps) {
  const data = [
    { name: 'Poor\n(0-59)', value: distribution.poor, color: 'hsl(var(--chart-5))' },
    { name: 'Moderate\n(60-74)', value: distribution.moderate, color: 'hsl(var(--chart-4))' },
    { name: 'Good\n(75-89)', value: distribution.good, color: 'hsl(var(--chart-3))' },
    { name: 'Excellent\n(90-100)', value: distribution.excellent, color: 'hsl(var(--chart-1))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Mean</p>
              <p className="text-lg font-semibold">{distribution.mean}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Median</p>
              <p className="text-lg font-semibold">{distribution.median}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Std Dev</p>
              <p className="text-lg font-semibold">{distribution.stdDev}</p>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
                label={{ 
                  value: 'Probability (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--foreground))' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                formatter={(value: number) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">
                  {item.name.replace('\n', ' ')}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
