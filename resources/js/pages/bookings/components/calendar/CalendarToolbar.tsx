import { ChevronLeft, ChevronRight, Columns3, Grid3x3, List, GanttChartSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DAY_LABELS, MONTH_LABELS } from './calendarUtils';

export type CalendarViewType = 'day' | 'week' | 'month' | 'timeline';

interface CalendarToolbarProps {
    view: CalendarViewType;
    onChangeView: (view: CalendarViewType) => void;
    currentDate: Date;
    onNavigate: (direction: 'prev' | 'next' | 'today') => void;
}

const VIEW_OPTIONS: { value: CalendarViewType; label: string; icon: typeof List }[] = [
    { value: 'day', label: 'Hari', icon: List },
    { value: 'week', label: 'Minggu', icon: Columns3 },
    { value: 'month', label: 'Bulan', icon: Grid3x3 },
    { value: 'timeline', label: 'Timeline', icon: GanttChartSquare },
];

function rangeLabel(view: CalendarViewType, date: Date): string {
    if (view === 'month') {
        return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
    }

    if (view === 'week') {
        return `Minggu ${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
    }

    const dayName = DAY_LABELS[(date.getDay() + 6) % 7];
    return `${dayName}, ${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function CalendarToolbar({ view, onChangeView, currentDate, onNavigate }: CalendarToolbarProps) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onNavigate('prev')} className="rounded-xl">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => onNavigate('today')} className="rounded-xl">
                    Hari Ini
                </Button>
                <Button variant="outline" size="icon" onClick={() => onNavigate('next')} className="rounded-xl">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <p className="ml-2 text-sm font-semibold text-gray-900">{rangeLabel(view, currentDate)}</p>
            </div>

            <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                {VIEW_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = view === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onChangeView(option.value)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
