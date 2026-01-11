import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SimulationResult } from '@/types/types';

interface ComparisonTableProps {
  optionA: SimulationResult;
  optionB: SimulationResult;
}

export default function ComparisonTable({ optionA, optionB }: ComparisonTableProps) {
  const compareValues = (a: number, b: number) => {
    const diff = a - b;
    if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-muted-foreground', text: 'Similar' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-success', text: `+${diff.toFixed(1)}` };
    return { icon: TrendingDown, color: 'text-destructive', text: diff.toFixed(1) };
  };

  const rows = [
    {
      metric: 'Mean Outcome',
      a: optionA.outcome_distribution.mean,
      b: optionB.outcome_distribution.mean,
      higherIsBetter: true
    },
    {
      metric: 'Median Outcome',
      a: optionA.outcome_distribution.median,
      b: optionB.outcome_distribution.median,
      higherIsBetter: true
    },
    {
      metric: 'Excellent Probability',
      a: optionA.outcome_distribution.excellent,
      b: optionB.outcome_distribution.excellent,
      higherIsBetter: true,
      unit: '%'
    },
    {
      metric: 'Poor Probability',
      a: optionA.outcome_distribution.poor,
      b: optionB.outcome_distribution.poor,
      higherIsBetter: false,
      unit: '%'
    },
    {
      metric: 'Burnout Risk',
      a: optionA.risk_breakdown.burnout,
      b: optionB.risk_breakdown.burnout,
      higherIsBetter: false,
      unit: '%'
    },
    {
      metric: 'Success Probability',
      a: optionA.risk_breakdown.success,
      b: optionB.risk_breakdown.success,
      higherIsBetter: true,
      unit: '%'
    },
    {
      metric: 'Confidence Level',
      a: optionA.confidence_level * 100,
      b: optionB.confidence_level * 100,
      higherIsBetter: true,
      unit: '%'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Metric</TableHead>
              <TableHead className="text-center">{optionA.option_name}</TableHead>
              <TableHead className="text-center">{optionB.option_name}</TableHead>
              <TableHead className="text-center">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const comparison = compareValues(row.a, row.b);
              const ComparisonIcon = comparison.icon;
              const winner = row.a > row.b ? 'a' : row.a < row.b ? 'b' : 'tie';
              
              return (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>{row.a.toFixed(1)}{row.unit || ''}</span>
                      {winner === 'a' && row.higherIsBetter && (
                        <Badge variant="default" className="text-xs">Best</Badge>
                      )}
                      {winner === 'a' && !row.higherIsBetter && (
                        <Badge variant="destructive" className="text-xs">Worst</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>{row.b.toFixed(1)}{row.unit || ''}</span>
                      {winner === 'b' && row.higherIsBetter && (
                        <Badge variant="default" className="text-xs">Best</Badge>
                      )}
                      {winner === 'b' && !row.higherIsBetter && (
                        <Badge variant="destructive" className="text-xs">Worst</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`flex items-center justify-center gap-1 ${comparison.color}`}>
                      <ComparisonIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{comparison.text}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
