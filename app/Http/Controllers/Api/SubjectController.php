<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 10;

        $query = Subject::where('user_id', $userId)
            ->select('id', 'name', 'code', 'teacher_name', 'description', 'color', 'status', 'created_at', 'updated_at');

        if ($request->filled('keyword')) {
            $keyword = $request->query('keyword');

            $query->where(function (Builder $query) use ($keyword): void {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('code', 'like', "%{$keyword}%")
                    ->orWhere('teacher_name', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $subjects = $query->latest()->paginate($perPage);

        return $this->successResponse('Lấy danh sách môn học thành công.', [
            'subjects' => $subjects->items(),
            'pagination' => [
                'current_page' => $subjects->currentPage(),
                'per_page' => $subjects->perPage(),
                'total' => $subjects->total(),
                'last_page' => $subjects->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate($this->rules($userId));
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $subject = Subject::create([
            'user_id' => $userId,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'teacher_name' => $validated['teacher_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#0d6efd',
            'status' => $validated['status'] ?? 'active',
        ]);

        return $this->successResponse('Thêm môn học thành công.', [
            'subject' => $subject,
        ], 201);
    }

    public function show(Request $request, Subject $subject): JsonResponse
    {
        if (! $this->belongsToCurrentUser($subject, $request)) {
            return $this->forbiddenResponse();
        }

        return $this->successResponse('Lấy chi tiết môn học thành công.', [
            'subject' => $subject,
        ]);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $userId = $request->user()->id;

        if (! $this->belongsToCurrentUser($subject, $request)) {
            return $this->forbiddenResponse();
        }

        try {
            $validated = $request->validate($this->rules($userId, $subject->id));
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $subject->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'teacher_name' => $validated['teacher_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? $subject->color,
            'status' => $validated['status'] ?? $subject->status,
        ]);

        return $this->successResponse('Cập nhật môn học thành công.', [
            'subject' => $subject->refresh(),
        ]);
    }

    public function destroy(Request $request, Subject $subject): JsonResponse
    {
        if (! $this->belongsToCurrentUser($subject, $request)) {
            return $this->forbiddenResponse();
        }

        $subject->delete();

        return $this->successResponse('Xóa môn học thành công.');
    }

    private function rules(int $userId, ?int $ignoreSubjectId = null): array
    {
        $uniqueName = Rule::unique('subjects', 'name')
            ->where(fn (Builder $query) => $query->where('user_id', $userId));

        if ($ignoreSubjectId !== null) {
            $uniqueName->ignore($ignoreSubjectId);
        }

        return [
            'name' => ['required', 'string', 'max:255', $uniqueName],
            'code' => ['nullable', 'string', 'max:50'],
            'teacher_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', Rule::in(['active', 'archived'])],
        ];
    }

    private function belongsToCurrentUser(Subject $subject, Request $request): bool
    {
        return $subject->user_id === $request->user()->id;
    }

    private function successResponse(string $message, array $data = [], int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== []) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Bạn không có quyền truy cập môn học này.',
        ], 403);
    }

    private function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $exception->errors(),
        ], 422);
    }
}
