import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { Variable } from '@/types/types';

interface VariableSliderProps {
  variable: Variable;
  onChange: (value: number) => void;
  onReset: () => void;
  defaultValue: number;
}

export default function VariableSlider({ 
  variable, 
  onChange, 
  onReset,
  defaultValue 
}: VariableSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label htmlFor={variable.name} className="text-sm font-medium">
            {variable.label}
          </Label>
          {variable.description && (
            <p className="text-xs text-muted-foreground">{variable.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {variable.value}{variable.unit || ''}
          </span>
          {variable.value !== defaultValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onReset}
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <Slider
        id={variable.name}
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={[variable.value]}
        onValueChange={(values) => onChange(values[0])}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{variable.min}{variable.unit || ''}</span>
        <span>{variable.max}{variable.unit || ''}</span>
      </div>
    </div>
  );
}
