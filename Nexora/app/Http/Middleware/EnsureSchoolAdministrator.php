<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isSchoolAdministrator()) {
            abort(403, 'Forbidden.');
        }

        return $next($request);
    }
}
