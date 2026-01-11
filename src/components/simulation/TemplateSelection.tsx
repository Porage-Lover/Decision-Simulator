import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check } from 'lucide-react';
import { getAllTemplates } from '@/db/api';
import type { ScenarioTemplate } from '@/types/types';

interface TemplateSelectionProps {
  onSelectTemplate: (template: ScenarioTemplate) => void;
  onSkip: () => void;
}

export default function TemplateSelection({ onSelectTemplate, onSkip }: TemplateSelectionProps) {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    const data = await getAllTemplates();
    setTemplates(data);
    setIsLoading(false);
  };

  const handleSelect = (template: ScenarioTemplate) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold">Choose a Template</h2>
        <p className="text-muted-foreground">
          Start with a pre-configured scenario or create from scratch
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold">{category}</h3>
              <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                {templates
                  .filter((t) => t.category === category)
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`glass cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                        selectedId === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSelect(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {template.icon && (
                              <span className="text-2xl">{template.icon}</span>
                            )}
                            <CardTitle className="text-base">{template.name}</CardTitle>
                          </div>
                          {selectedId === template.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.time_horizon_weeks} weeks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(template.variables).length} variables
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onSkip} size="lg">
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}
