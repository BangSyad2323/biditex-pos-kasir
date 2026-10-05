<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate; // <--- Import Gate
use App\Models\User;                  // <--- Import Model User

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Definisi otorisasi untuk Owner Access
        Gate::define('owner-access', function (User $user) {
            return $user->role === 'owner';
        });
    }
}