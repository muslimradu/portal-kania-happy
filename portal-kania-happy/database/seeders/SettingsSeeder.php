<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key'       => 'app_name',
                'value'     => 'Portal Kania Happy',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Application Name',
                'is_public' => true,
            ],
            [
                'key'       => 'app_tagline',
                'value'     => 'Rumah Sehat & Sanggar Senam',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Tagline',
                'is_public' => true,
            ],
            [
                'key'       => 'app_primary_color',
                'value'     => '#7C3AED',
                'type'      => 'string',
                'group'     => 'branding',
                'label'     => 'Primary Color',
                'is_public' => true,
            ],
            [
                'key'       => 'app_logo',
                'value'     => null,
                'type'      => 'string',
                'group'     => 'branding',
                'label'     => 'Logo',
                'is_public' => true,
            ],
            [
                'key'       => 'app_favicon',
                'value'     => null,
                'type'      => 'string',
                'group'     => 'branding',
                'label'     => 'Favicon',
                'is_public' => true,
            ],
            [
                'key'       => 'app_timezone',
                'value'     => 'Asia/Jakarta',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Timezone',
                'is_public' => false,
            ],
            [
                'key'       => 'app_currency',
                'value'     => 'IDR',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Currency',
                'is_public' => true,
            ],
            [
                'key'       => 'app_date_format',
                'value'     => 'DD/MM/YYYY',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Date Format',
                'is_public' => true,
            ],
            [
                'key'       => 'app_phone_prefix',
                'value'     => '628',
                'type'      => 'string',
                'group'     => 'general',
                'label'     => 'Phone Prefix',
                'is_public' => true,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
