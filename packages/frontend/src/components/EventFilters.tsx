import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import CustomDateRangePicker from "@/components/CustomDateRangePicker";
import { Filter, MapPin, Clock, Trophy } from "lucide-react";
import {
  UseGeolocationReturn,
  UseDateFilteringReturn,
  UseArraySelectionReturn,
  getAvailableRankingLevels,
} from "@/hooks";

/**
 * EventFilters Component
 *
 * Reusable filters component for Events page
 * Controlled component - state managed by parent via hooks
 */

interface EventFiltersProps {
  geolocation: UseGeolocationReturn;
  dateFilter: UseDateFilteringReturn;
  levelSelection: UseArraySelectionReturn<string>;
  hideFullyBooked: boolean;
  setHideFullyBooked: (value: boolean) => void;
  userRanking: string | null;
  currentUserId: string | null;
  onPlaceSelected: (place: any) => void;
}

export const EventFilters = ({
  geolocation,
  dateFilter,
  levelSelection,
  hideFullyBooked,
  setHideFullyBooked,
  userRanking,
  currentUserId,
  onPlaceSelected,
}: EventFiltersProps) => {
  const availableLevels = getAvailableRankingLevels(userRanking);

  const handleClearFilters = () => {
    geolocation.resetLocation();
    dateFilter.resetDateFilter();
    levelSelection.set(availableLevels);
    setHideFullyBooked(false);
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filters</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Where Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Where</span>
          </div>
          <LocationAutocomplete
            value={geolocation.selectedLocation}
            onChange={geolocation.setSelectedLocation}
            onPlaceSelected={onPlaceSelected}
            placeholder="Enter a city..."
            className="text-sm"
          />
          <Select
            value={geolocation.selectedRadius}
            onValueChange={geolocation.setSelectedRadius}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* When Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">When</span>
          </div>
          <div className="relative">
            <Select
              value={dateFilter.selectedDate}
              onValueChange={(value: any) => {
                dateFilter.setSelectedDate(value);
                if (value === "custom") {
                  dateFilter.setShowCustomDatePicker(true);
                } else {
                  dateFilter.setShowCustomDatePicker(false);
                  dateFilter.setCustomDateFrom(undefined);
                  dateFilter.setCustomDateTo(undefined);
                }
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
                <SelectItem value="next-3-weeks">Next 3 Weeks</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range Picker */}
            {dateFilter.showCustomDatePicker && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50">
                <CustomDateRangePicker
                  onRangeSelect={(from, to) => {
                    dateFilter.setCustomDateFrom(from);
                    dateFilter.setCustomDateTo(to);
                    if (from && to) {
                      dateFilter.setSelectedDate("custom");
                    }
                  }}
                  onClose={() => dateFilter.setShowCustomDatePicker(false)}
                />
              </div>
            )}

            {/* Display selected custom range */}
            {dateFilter.selectedDate === "custom" &&
              dateFilter.customDateFrom &&
              dateFilter.customDateTo && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {dateFilter.customDateFrom.toLocaleDateString()} -{" "}
                  {dateFilter.customDateTo.toLocaleDateString()}
                </div>
              )}
          </div>
        </div>

        {/* Match Level Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Ranking {currentUserId && "*"}
            </span>
          </div>
          <div className="space-y-2">
            {availableLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={levelSelection.isSelected(level)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      levelSelection.add(level);
                    } else {
                      // Prevent unchecking if it's the last one
                      if (levelSelection.count > 1) {
                        levelSelection.remove(level);
                      }
                    }
                  }}
                />
                <label
                  htmlFor={`level-${level}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {level.replace("p", "P").replace("-", " - ").toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Hide Fully Booked Toggle */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hide-fully-booked"
              checked={hideFullyBooked}
              onCheckedChange={(checked) => setHideFullyBooked(!!checked)}
            />
            <label
              htmlFor="hide-fully-booked"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Hide Fully Booked
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
