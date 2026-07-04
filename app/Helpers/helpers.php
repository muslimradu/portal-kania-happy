<?php

declare(strict_types=1);

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

if (! function_exists('setting')) {
    function setting(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $setting = Setting::where('key', $key)->first();

            return $setting ? $setting->getTypedValue() : $default;
        });
    }
}
