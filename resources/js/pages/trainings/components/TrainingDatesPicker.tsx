import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatTrainingDates } from '../trainingHelpers';

dayjs.locale('id');

interface TrainingDatesPickerProps {
    value: string[];
    onChange: (dates: string[]) => void;
    error?: string;
}

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: dayjs().month(index).format('MMMM'),
}));

function toDateKey(date: dayjs.Dayjs): string {
    return date.format('YYYY-MM-DD');
}

function buildCalendarDays(month: dayjs.Dayjs): dayjs.Dayjs[] {
    const start = month.startOf('month').startOf('week');
    const end = month.endOf('month').endOf('week');
    const days: dayjs.Dayjs[] = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
        days.push(current);
        current = current.add(1, 'day');
    }

    return days;
}

export default function TrainingDatesPicker({ value, onChange, error }: TrainingDatesPickerProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [viewMonth, setViewMonth] = useState(() => {
        const first = value.filter(Boolean).sort()[0];
        const initial = first ? dayjs(first) : dayjs();
        return initial.isBefore(dayjs(), 'month') ? dayjs() : initial;
    });

    const today = dayjs().startOf('day');
    const selectedDates = useMemo(
        () => [...new Set(value.filter(Boolean))].sort(),
        [value],
    );
    const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);
    const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
    const selectedSummary = useMemo(() => formatTrainingDates(selectedDates), [selectedDates]);

    const yearOptions = useMemo(() => {
        const currentYear = dayjs().year();

        return Array.from({ length: 6 }, (_, index) => currentYear + index);
    }, []);

    useEffect(() => {
        if (!open || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const popupWidth = 252;
        const left = Math.min(rect.left, window.innerWidth - popupWidth - 16);

        setPopupPosition({
            top: rect.bottom + 8,
            left: Math.max(16, left),
        });
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (wrapperRef.current?.contains(target) || popupRef.current?.contains(target)) {
                return;
            }

            setOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const isPast = (day: dayjs.Dayjs) => day.startOf('day').isBefore(today);

    const toggleDate = (day: dayjs.Dayjs) => {
        const dateKey = toDateKey(day);

        if (selectedSet.has(dateKey)) {
            onChange(selectedDates.filter((date) => date !== dateKey));
            return;
        }

        if (isPast(day)) return;

        onChange([...selectedDates, dateKey].sort());
    };

    const popup = open ? (
        <div
            ref={popupRef}
            className="fixed z-[100] w-[252px] rounded-xl border border-gray-200 bg-white p-2.5 shadow-xl"
            style={{ top: popupPosition.top, left: popupPosition.left }}
        >
            <div className="mb-2 flex items-center gap-1.5">
                <select
                    value={viewMonth.month()}
                    onChange={(event) =>
                        setViewMonth(viewMonth.month(Number(event.target.value)))
                    }
                    className="h-8 flex-1 rounded-lg border border-gray-200 bg-white px-2 text-xs capitalize text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                >
                    {MONTHS.map((month) => (
                        <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>
                <select
                    value={viewMonth.year()}
                    onChange={(event) =>
                        setViewMonth(viewMonth.year(Number(event.target.value)))
                    }
                    className="h-8 w-[84px] rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                >
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="py-0.5 text-center text-[10px] font-medium text-gray-400">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day) => {
                    const dateKey = toDateKey(day);
                    const inCurrentMonth = day.month() === viewMonth.month();
                    const isSelected = selectedSet.has(dateKey);
                    const past = isPast(day);
                    const disabled = past && !isSelected;

                    return (
                        <button
                            key={`${dateKey}-${inCurrentMonth ? 'current' : 'other'}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleDate(day)}
                            className={`flex h-7 w-full items-center justify-center rounded-md text-xs transition ${
                                isSelected
                                    ? 'font-semibold text-white hover:opacity-90'
                                    : past || !inCurrentMonth
                                      ? 'cursor-not-allowed text-gray-300'
                                      : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={
                                isSelected
                                    ? { backgroundColor: 'var(--brand-primary)' }
                                    : undefined
                            }
                            title={
                                isSelected
                                    ? 'Klik untuk hapus pilihan'
                                    : past
                                      ? 'Tanggal lampau tidak bisa dipilih'
                                      : undefined
                            }
                        >
                            {day.date()}
                        </button>
                    );
                })}
            </div>
        </div>
    ) : null;

    return (
        <div className="space-y-1.5" ref={wrapperRef}>
            <Label>Tanggal Pelatihan</Label>

            <div className="flex items-center gap-2">
                <div
                    className={`flex h-9 min-w-0 flex-1 items-center rounded-xl border px-2.5 text-xs ${
                        selectedDates.length > 0
                            ? 'font-medium'
                            : 'border-dashed text-gray-400'
                    }`}
                    style={
                        selectedDates.length > 0
                            ? {
                                  borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, white)',
                                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, white)',
                                  color: 'var(--brand-primary)',
                              }
                            : undefined
                    }
                    title={selectedDates.length > 0 ? selectedSummary : undefined}
                >
                    <span className="truncate">
                        {selectedDates.length > 0 ? selectedSummary : 'Belum ada tanggal dipilih'}
                    </span>
                </div>

                <Button
                    ref={triggerRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 rounded-xl px-3"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                    Pilih Tanggal
                </Button>
            </div>

            <p className="text-[11px] text-gray-400">
                Klik tanggal terpilih lagi untuk membatalkan. Hanya hari ini ke depan yang bisa ditambahkan.
            </p>

            {typeof document !== 'undefined' && popup ? createPortal(popup, document.body) : null}

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
