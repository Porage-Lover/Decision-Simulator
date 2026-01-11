import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Assumption } from '@/types/types';

interface AssumptionsEditorProps {
  assumptions: Assumption[];
  onChange: (assumptions: Assumption[]) => void;
  onReset: () => void;
}

export default function AssumptionsEditor({ 
  assumptions, 
  onChange,
  onReset 
}: AssumptionsEditorProps) {
  const [newAssumption, setNewAssumption] = useState('');

  const handleAdd = () => {
    if (newAssumption.trim()) {
      const newItem: Assumption = {
        id: Date.now().toString(),
        text: newAssumption.trim(),
        editable: true
      };
      onChange([...assumptions, newItem]);
      setNewAssumption('');
    }
  };

  const handleUpdate = (id: string, text: string) => {
    onChange(
      assumptions.map(a => 
        a.id === id ? { ...a, text } : a
      )
    );
  };

  const handleRemove = (id: string) => {
    onChange(assumptions.filter(a => a.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Simulation Assumptions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These assumptions define how the simulation models your decision over time. 
          You can edit or add custom assumptions.
        </p>

        {/* Existing assumptions */}
        <div className="space-y-3">
          {assumptions.map((assumption) => (
            <div key={assumption.id} className="flex gap-2">
              <Textarea
                value={assumption.text}
                onChange={(e) => handleUpdate(assumption.id, e.target.value)}
                disabled={!assumption.editable}
                className="min-h-[60px] flex-1 resize-none"
              />
              {assumption.editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(assumption.id)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add new assumption */}
        <div className="space-y-2 border-t border-border pt-4">
          <label className="text-sm font-medium">Add Custom Assumption</label>
          <div className="flex gap-2">
            <Input
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              placeholder="Enter a new assumption..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button onClick={handleAdd} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
