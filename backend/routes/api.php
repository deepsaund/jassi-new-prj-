<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\ServiceCatalogController;
use App\Http\Controllers\Customer\ServiceRequestController;
use App\Http\Controllers\Customer\VaultController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RequestReviewController;
use App\Http\Controllers\Admin\QueueController;
use App\Http\Controllers\Admin\WorkflowController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Chat\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FileController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });
});

// Protected routes
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {

    // Services catalog (customer + b2b)
    Route::middleware('role:customer,b2b,admin,staff')->group(function () {
        Route::get('/services', [ServiceCatalogController::class, 'index']);
        Route::get('/services/{id}', [ServiceCatalogController::class, 'show']);
    });

    // Customer / B2B routes
    Route::middleware('role:customer,b2b')->group(function () {
        Route::post('/requests', [ServiceRequestController::class, 'store']);
        Route::get('/requests', [ServiceRequestController::class, 'index']);
        Route::get('/requests/{id}', [ServiceRequestController::class, 'show'])->middleware('request.owner');
        Route::post('/requests/{id}/reupload', [ServiceRequestController::class, 'reupload'])->middleware('request.owner');
        Route::get('/requests/{id}/output/download', [ServiceRequestController::class, 'downloadOutput'])->middleware('request.owner');

        Route::get('/vault', [VaultController::class, 'index']);
        Route::post('/vault', [VaultController::class, 'store']);
        Route::delete('/vault/{id}', [VaultController::class, 'destroy']);
        Route::get('/vault/suggest/{serviceId}', [VaultController::class, 'suggest']);
    });

    // Notifications (all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

    // Chat (all authenticated users, access checked in controller)
    Route::get('/chat/{requestId}/messages', [ChatController::class, 'index']);
    Route::post('/chat/{requestId}/messages', [ChatController::class, 'store']);

    // Files (auth-gated)
    Route::get('/files/{type}/{id}', [FileController::class, 'serve']);

    // Admin routes
    Route::prefix('admin')->middleware(['role:admin', 'audit'])->group(function () {
        Route::apiResource('services', ServiceController::class);
        Route::apiResource('users', UserController::class);

        Route::get('/requests', [RequestReviewController::class, 'index']);
        Route::get('/requests/{id}', [RequestReviewController::class, 'show']);
        Route::put('/requests/{id}/review', [RequestReviewController::class, 'review']);
        Route::post('/requests/{id}/request-reupload', [RequestReviewController::class, 'requestReupload']);
        Route::put('/requests/{id}/complete', [RequestReviewController::class, 'review']); // TODO: separate complete
        Route::put('/requests/{id}/delivery', [RequestReviewController::class, 'review']); // TODO: separate delivery

        Route::get('/queue', [QueueController::class, 'index']);
        Route::post('/queue/{id}/claim', [QueueController::class, 'claim']);
        Route::post('/queue/{id}/unclaim', [QueueController::class, 'unclaim']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/audit', [AuditController::class, 'index']);
        Route::get('/audit/staff/{userId}', [AuditController::class, 'staffAudit']);
        Route::get('/audit/request/{requestId}', [AuditController::class, 'requestAudit']);

        Route::get('/customers/{id}/detail', [AuditController::class, 'customerDetail']);

        Route::post('/workflow/create-customer', [WorkflowController::class, 'createCustomer']);
        Route::post('/workflow/on-behalf-request', [WorkflowController::class, 'onBehalfRequest']);
    });

    // Staff routes (same controllers, scoped)
    Route::prefix('staff')->middleware(['role:staff', 'audit'])->group(function () {
        Route::get('/requests', [RequestReviewController::class, 'index']);
        Route::get('/requests/{id}', [RequestReviewController::class, 'show']);
        Route::put('/requests/{id}/review', [RequestReviewController::class, 'review']);
        Route::post('/requests/{id}/request-reupload', [RequestReviewController::class, 'requestReupload']);

        Route::get('/queue', [QueueController::class, 'index']);
        Route::post('/queue/{id}/claim', [QueueController::class, 'claim']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/audit', function (Illuminate\Http\Request $request) {
            return app(AuditController::class)->staffAudit($request->user()->id, $request);
        });

        Route::get('/customers/{id}/detail', [AuditController::class, 'customerDetail']);

        Route::post('/workflow/create-customer', [WorkflowController::class, 'createCustomer']);
        Route::post('/workflow/on-behalf-request', [WorkflowController::class, 'onBehalfRequest']);
    });
});
