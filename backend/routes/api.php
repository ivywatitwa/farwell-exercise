<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CsvDataController;


Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/activate', [AuthenticationController::class, 'activate']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthenticationController::class, 'logout']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/profile', [UserController::class, 'update']);
    Route::put('/users/password', [UserController::class, 'changePassword']);
    Route::post('/upload-csv', [CsvDataController::class, 'upload']);
    Route::get('/csv/content/{id}', [CsvDataController::class, 'getCsvContent']);
    Route::get('/csv/data', [CsvDataController::class, 'getData']);
});
