<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

'allowed_origins' => array_filter(explode(
    ',',
    env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,https://nexora-tau-tan.vercel.app,https://nexora-git-main-karudesu2.vercel.app'
    )
)),
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-token clients do not require cookies, but this supports Sanctum's
    // first-party SPA mode without opening protected routes.
    'supports_credentials' => true,
];
