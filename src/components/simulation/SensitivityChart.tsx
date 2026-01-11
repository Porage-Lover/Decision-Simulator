import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { SensitivityAnalysis } from '@/types/types';

interface SensitivityChartProps {
  analysis: SensitivityAnalysis;
  title?: string;
}

export default function SensitivityChart({ analysis, title = 'Sensitivity Analysis' }: SensitivityChartProps) {
  const chartData = analysis.results.map(result => ({
    name: result.variableLabel,
    impact: Math.round(result.impact * 10) / 10,
    isTopInfluencer: analysis.topInfluencers.some(top => top.variableName === result.variableName)
  }));

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>
          Shows which variables have the most impact on outcomes (±20% change)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Influencers */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-primary">Top 3 Most Influential Variables</h4>
          </div>
          <div className="space-y-2">
            {analysis.topInfluencers.map((influencer, index) => (
              <div key={influencer.variableName} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {index + 1}. {influencer.variableLabel}
                </span>
                <span className="text-primary">
                  Impact: {Math.round(influencer.impact * 10) / 10}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              stroke="hsl(var(--border))"
              label={{ 
                value: 'Impact Score', 
                position: 'insideBottom', 
                offset: -5,
                style: { fill: 'hsl(var(--foreground))' }
              }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              stroke="hsl(var(--border))"
              width={120}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))'
              }}
              formatter={(value: number) => [value.toFixed(1), 'Impact']}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isTopInfluencer ? 'hsl(var(--primary))' : 'hsl(var(--chart-3))'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Explanation */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            <strong>How to read this:</strong> Higher impact scores indicate variables that significantly affect outcomes. 
            Focus on optimizing the top influencers for the best results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
