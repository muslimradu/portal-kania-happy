<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

trait AuthorizesPermissions
{
    protected function authorizePermission(string $permission): void
    {
        abort_unless(auth()->user()?->can($permission), 403);
    }
}
