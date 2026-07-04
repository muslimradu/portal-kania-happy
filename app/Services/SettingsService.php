<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    protected ?Collection $memoized = null;

    public function all(): Collection
    {
        if ($this->memoized !== null) {
            return $this->memoized;
        }

        $cached = Cache::rememberForever('settings:all', function () {
            return Setting::all()->toArray();
        });

        $this->memoized = collect($cached)->map(function (array $item) {
            $setting = new Setting();
            $setting->forceFill($item);
            $setting->exists = true;
            return $setting;
        });

        return $this->memoized;
    }

    public function getPublic(): array
    {
        return $this->all()
            ->where('is_public', true)
            ->mapWithKeys(fn (Setting $setting) => [
                $setting->key => $setting->getTypedValue(),
            ])
            ->toArray();
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $setting = $this->all()->firstWhere('key', $key);

        return $setting ? $setting->getTypedValue() : $default;
    }

    public function update(string $key, mixed $value): Setting
    {
        $setting = Setting::where('key', $key)->first();

        if (! $setting) {
            throw new \InvalidArgumentException("Setting [{$key}] not found.");
        }

        $setting->value = is_array($value) ? json_encode($value) : (string) $value;
        $setting->save();

        Cache::forget('settings:all');
        $this->memoized = null;

        return $setting;
    }

    public function updateMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $this->update($key, $value);
        }
    }

    public function getByGroup(string $group): Collection
    {
        return $this->all()->where('group', $group);
    }
}