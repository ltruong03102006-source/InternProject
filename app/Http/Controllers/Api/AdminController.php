<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use App\Models\Document;
use App\Models\Note;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['summary' => ['users' => User::count(), 'subjects' => Subject::count(), 'notes' => Note::count(), 'deadlines' => Deadline::count(), 'documents' => Document::count()]]]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query()->withCount(['subjects', 'notes', 'deadlines']);
        if ($request->filled('keyword')) {
            $k = $request->keyword;
            $query->where(fn ($q) => $q->where('name', 'like', "%{$k}%")->orWhere('email', 'like', "%{$k}%")->orWhere('student_code', 'like', "%{$k}%"));
        }

        return response()->json(['success' => true, 'data' => ['users' => $query->latest()->paginate(10)]]);
    }

    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Không thể tự khóa tài khoản đang đăng nhập.'], 422);
        }
        $user->update(['status' => ! $user->status]);
        $user->tokens()->delete();

        return response()->json(['success' => true, 'message' => $user->status ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.', 'data' => ['user' => $user]]);
    }

    public function subjects(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['subjects' => Subject::with('user:id,name,email')->latest()->paginate(10)]]);
    }

    public function deadlines(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['deadlines' => Deadline::with(['user:id,name,email', 'subject:id,name'])->orderBy('due_at')->paginate(10)]]);
    }
}
