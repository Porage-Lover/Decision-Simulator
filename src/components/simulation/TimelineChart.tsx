import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimelineDataPoint } from '@/types/types';

interface TimelineChartProps {
  data: TimelineDataPoint[];
  title: string;
}

export default function TimelineChart({ data, title }: TimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="week" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              stroke="hsl(var(--border))"
              label={{ 
                value: 'Week', 
                position: 'insideBottom', 
                offset: -5,
                style: { fill: 'hsl(var(--foreground))' }
              }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              stroke="hsl(var(--border))"
              domain={[0, 100]}
              label={{ 
                value: 'Score', 
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
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="outcome" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              name="Outcome"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="motivation" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              name="Motivation"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="skill" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Skill"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="stress" 
              stroke="hsl(var(--chart-5))" 
              strokeWidth={2}
              name="Stress"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="consistency" 
              stroke="hsl(var(--chart-4))" 
              strokeWidth={2}
              name="Consistency"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
