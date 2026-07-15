<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::get('/subjects/{subject}', [SubjectController::class, 'show'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy môn học.',
    ], 404));
    Route::put('/subjects/{subject}', [SubjectController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy môn học.',
    ], 404));
    Route::patch('/subjects/{subject}', [SubjectController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy môn học.',
    ], 404));
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy môn học.',
    ], 404));
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::get('/notes/{note}', [NoteController::class, 'show'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy ghi chú.',
    ], 404));
    Route::put('/notes/{note}', [NoteController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy ghi chú.',
    ], 404));
    Route::patch('/notes/{note}', [NoteController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy ghi chú.',
    ], 404));
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy ghi chú.',
    ], 404));
    Route::patch('/notes/{note}/pin', [NoteController::class, 'togglePin'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy ghi chú.',
    ], 404));
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::get('/tags/{tag}', [TagController::class, 'show'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy tag.',
    ], 404));
    Route::put('/tags/{tag}', [TagController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy tag.',
    ], 404));
    Route::patch('/tags/{tag}', [TagController::class, 'update'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy tag.',
    ], 404));
    Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy tag.',
    ], 404));
    Route::get('/tags/{tag}/notes', [TagController::class, 'notes'])->missing(fn () => response()->json([
        'success' => false,
        'message' => 'Không tìm thấy tag.',
    ], 404));
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
});
