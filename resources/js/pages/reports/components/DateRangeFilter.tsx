import { Input } from '@/components/ui/input';

export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | '';

export interface DateRangeValue {
    preset: DateRangePreset;
    date_from?: string;
    date_to?: string;
}

interface DateRangeFilterProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
}

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
    { value: '', label: 'Semua' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'this_week', label: 'Minggu Ini' },
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'custom', label: 'Custom' },
];

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.value || 'all'}
                        type="button"
                        onClick={() => onChange({ preset: preset.value, date_from: undefined, date_to: undefined })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            value.preset === preset.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            {value.preset === 'custom' && (
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={value.date_from ?? ''}
                        onChange={(e) => onChange({ ...value, date_from: e.target.value })}
                        className="rounded-xl text-sm"
                    />
                    <span className="text-xs text-gray-400">s/d</span>
                    <Input
                        type="date"
                        value={value.date_to ?? ''}
                        onChange={(e) => onChange({ ...value, date_to: e.target.value })}
                        className="rounded-xl text-sm"
                    />
                </div>
            )}
        </div>
    );
}
