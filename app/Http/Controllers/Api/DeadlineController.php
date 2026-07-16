<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeadlineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Deadline::with('subject:id,name,code,color')->where('user_id', $request->user()->id);
        if ($request->filled('keyword')) {
            $query->where('title', 'like', '%'.$request->keyword.'%');
        }
        foreach (['subject_id', 'status', 'priority', 'type'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->$field);
            }
        }
        if ($request->filled('from')) {
            $query->where('due_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('due_at', '<=', $request->to);
        }
        if ($request->boolean('overdue')) {
            $query->where('due_at', '<', now())->whereNotIn('status', ['completed', 'cancelled']);
        }
        if ($request->boolean('upcoming')) {
            $query->whereBetween('due_at', [now(), now()->addDays(7)])->whereNotIn('status', ['completed', 'cancelled']);
        }

        return response()->json(['success' => true, 'data' => ['deadlines' => $query->orderBy('due_at')->paginate(min((int) $request->input('per_page', 10), 100))]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        if (! $this->validSubject($data['subject_id'] ?? null, $request->user()->id)) {
            return $this->invalidSubject();
        }
        $data['user_id'] = $request->user()->id;
        $this->setCompletedAt($data);
        $deadline = Deadline::create($data)->load('subject:id,name,code,color');

        return response()->json(['success' => true, 'message' => 'Tạo deadline thành công.', 'data' => ['deadline' => $deadline]], 201);
    }

    public function show(Request $request, Deadline $deadline): JsonResponse
    {
        if ($deadline->user_id !== $request->user()->id) {
            return $this->forbidden();
        }

        return response()->json(['success' => true, 'data' => ['deadline' => $deadline->load('subject:id,name,code,color')]]);
    }

    public function update(Request $request, Deadline $deadline): JsonResponse
    {
        if ($deadline->user_id !== $request->user()->id) {
            return $this->forbidden();
        }
        $data = $this->validated($request);
        if (! $this->validSubject($data['subject_id'] ?? null, $request->user()->id)) {
            return $this->invalidSubject();
        }
        $this->setCompletedAt($data);
        $deadline->update($data);

        return response()->json(['success' => true, 'message' => 'Cập nhật deadline thành công.', 'data' => ['deadline' => $deadline->fresh()->load('subject:id,name,code,color')]]);
    }

    public function destroy(Request $request, Deadline $deadline): JsonResponse
    {
        if ($deadline->user_id !== $request->user()->id) {
            return $this->forbidden();
        }
        $deadline->delete();

        return response()->json(['success' => true, 'message' => 'Xóa deadline thành công.']);
    }

    public function updateStatus(Request $request, Deadline $deadline): JsonResponse
    {
        if ($deadline->user_id !== $request->user()->id) {
            return $this->forbidden();
        }
        $data = $request->validate(['status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])]]);
        $data['completed_at'] = $data['status'] === 'completed' ? ($deadline->completed_at ?? now()) : null;
        $deadline->update($data);

        return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái thành công.', 'data' => ['deadline' => $deadline->fresh()]]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'],
            'subject_id' => ['nullable', 'integer'], 'type' => ['required', Rule::in(['assignment', 'exam', 'presentation', 'project', 'other'])],
            'due_at' => ['required', 'date'], 'priority' => ['required', Rule::in(['low', 'medium', 'high'])],
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])], 'remind_at' => ['nullable', 'date'],
        ]);
    }

    private function validSubject(?int $id, int $userId): bool
    {
        return ! $id || Subject::whereKey($id)->where('user_id', $userId)->exists();
    }

    private function setCompletedAt(array &$data): void
    {
        $data['completed_at'] = $data['status'] === 'completed' ? now() : null;
    }

    private function forbidden(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Bạn không có quyền truy cập deadline này.'], 403);
    }

    private function invalidSubject(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Môn học không hợp lệ.'], 422);
    }
}
