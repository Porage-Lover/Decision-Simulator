import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, TrendingUp, XCircle } from 'lucide-react';
import type { RiskBreakdown } from '@/types/types';

interface RiskBreakdownDisplayProps {
  risks: RiskBreakdown;
  title?: string;
}

export default function RiskBreakdownDisplay({ 
  risks, 
  title = 'Risk Analysis' 
}: RiskBreakdownDisplayProps) {
  const riskItems = [
    {
      name: 'Success Probability',
      value: risks.success,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success',
      description: 'Likelihood of achieving excellent outcomes'
    },
    {
      name: 'Plateau Risk',
      value: risks.plateau,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning',
      description: 'Risk of stagnating without significant progress'
    },
    {
      name: 'Burnout Risk',
      value: risks.burnout,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive',
      description: 'Risk of exhaustion and inability to continue'
    },
    {
      name: 'Dropout Risk',
      value: risks.dropout,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive',
      description: 'Risk of abandoning the path entirely'
    }
  ];

  const getRiskLevel = (value: number) => {
    if (value >= 70) return 'High';
    if (value >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskItems.map((item) => {
          const Icon = item.icon;
          const level = getRiskLevel(item.value);
          
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{item.value}%</p>
                  <p className="text-xs text-muted-foreground">{level}</p>
                </div>
              </div>
              <Progress 
                value={item.value} 
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
