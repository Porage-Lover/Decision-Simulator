import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Scenario } from '@/types/types';

interface SimulationCardProps {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}

export default function SimulationCard({ scenario, onDelete }: SimulationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{scenario.title}</CardTitle>
            {scenario.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {scenario.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Option A
            </Badge>
            <span className="text-sm">{scenario.option_a}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-secondary/10 text-secondary">
              Option B
            </Badge>
            <span className="text-sm">{scenario.option_b}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{scenario.time_horizon_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(scenario.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to={`/results/${scenario.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Results
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(scenario.id)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
