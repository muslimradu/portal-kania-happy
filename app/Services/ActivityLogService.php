<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogService
{
    public function log(
        string $module,
        string $action,
        ?string $description = null,
        ?Request $request = null,
        ?array $properties = null,
    ): ActivityLog {
        $request ??= request();

        return ActivityLog::create([
            'user_id'     => auth()->id(),
            'module'      => $module,
            'action'      => $action,
            'description' => $description,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'properties'  => $properties,
            'created_by'  => auth()->id(),
        ]);
    }
}