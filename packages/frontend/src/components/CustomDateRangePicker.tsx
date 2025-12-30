import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CustomDateRangePickerProps {
  onRangeSelect: (from: Date | undefined, to: Date | undefined) => void;
  onClose: () => void;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onRangeSelect,
  onClose
}) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  const handleApply = () => {
    onRangeSelect(dateFrom, dateTo);
    onClose();
  };

  const handleClear = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onRangeSelect(undefined, undefined);
    onClose();
  };

  return (
    <div className="p-4 space-y-4 bg-card border border-border rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Custom Date Range</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* From Date */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">From</label>
          <Popover open={fromPickerOpen} onOpenChange={setFromPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(date) => {
                  setDateFrom(date);
                  setFromPickerOpen(false);
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">To</label>
          <Popover open={toPickerOpen} onOpenChange={setToPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(date) => {
                  setDateTo(date);
                  setToPickerOpen(false);
                }}
                disabled={(date) => dateFrom ? date < dateFrom : false}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
          Clear
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default CustomDateRangePicker;