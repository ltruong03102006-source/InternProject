<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Subject;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 10;

        $query = Note::with(['subject:id,name,code,color', 'tags:id,name,color'])
            ->where('user_id', $userId);

        if ($request->filled('keyword')) {
            $keyword = $request->query('keyword');

            $query->where(function (Builder $query) use ($keyword): void {
                $query->where('title', 'like', "%{$keyword}%")
                    ->orWhere('content', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('subject_id')) {
            $subjectId = (int) $request->query('subject_id');

            if (! $this->validSubject($subjectId, $userId)) {
                return $this->invalidSubjectResponse();
            }

            $query->where('subject_id', $subjectId);
        }

        if ($request->filled('tag_id')) {
            $tagId = (int) $request->query('tag_id');

            if (! $this->validTag($tagId, $userId)) {
                return $this->invalidTagResponse();
            }

            $query->whereHas('tags', fn (Builder $query) => $query->where('tags.id', $tagId));
        }

        if ($request->filled('is_pinned')) {
            $query->where('is_pinned', $request->boolean('is_pinned'));
        }

        $notes = $query->orderByDesc('is_pinned')
            ->latest()
            ->paginate($perPage);

        return $this->successResponse('Lấy danh sách ghi chú thành công.', [
            'notes' => $notes->items(),
            'pagination' => [
                'current_page' => $notes->currentPage(),
                'per_page' => $notes->perPage(),
                'total' => $notes->total(),
                'last_page' => $notes->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate($this->rules());
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $subjectId = $validated['subject_id'] ?? null;
        if ($subjectId !== null && ! $this->validSubject((int) $subjectId, $userId)) {
            return $this->invalidSubjectResponse();
        }

        $tagIds = $this->uniqueTagIds($validated['tag_ids'] ?? []);
        if ($tagIds !== [] && ! $this->validTags($tagIds, $userId)) {
            return $this->invalidTagResponse();
        }

        $note = DB::transaction(function () use ($validated, $userId, $subjectId, $tagIds): Note {
            $note = Note::create([
                'user_id' => $userId,
                'subject_id' => $subjectId,
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'is_pinned' => $validated['is_pinned'] ?? false,
                'visibility' => $validated['visibility'] ?? 'private',
            ]);

            if ($tagIds !== []) {
                $note->tags()->sync($tagIds);
            }

            return $note;
        });

        return $this->successResponse('Thêm ghi chú thành công.', [
            'note' => $this->loadNoteRelations($note),
        ], 201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        if (! $this->belongsToCurrentUser($note, $request)) {
            return $this->forbiddenResponse();
        }

        return $this->successResponse('Lấy chi tiết ghi chú thành công.', [
            'note' => $this->loadNoteRelations($note),
        ]);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        $userId = $request->user()->id;

        if (! $this->belongsToCurrentUser($note, $request)) {
            return $this->forbiddenResponse();
        }

        try {
            $validated = $request->validate($this->rules());
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $subjectId = $validated['subject_id'] ?? null;
        if ($subjectId !== null && ! $this->validSubject((int) $subjectId, $userId)) {
            return $this->invalidSubjectResponse();
        }

        $tagIds = array_key_exists('tag_ids', $validated)
            ? $this->uniqueTagIds($validated['tag_ids'] ?? [])
            : null;

        if (is_array($tagIds) && $tagIds !== [] && ! $this->validTags($tagIds, $userId)) {
            return $this->invalidTagResponse();
        }

        DB::transaction(function () use ($note, $validated, $subjectId, $tagIds): void {
            $note->update([
                'subject_id' => $subjectId,
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'is_pinned' => $validated['is_pinned'] ?? $note->is_pinned,
                'visibility' => $validated['visibility'] ?? $note->visibility,
            ]);

            if (is_array($tagIds)) {
                $note->tags()->sync($tagIds);
            }
        });

        return $this->successResponse('Cập nhật ghi chú thành công.', [
            'note' => $this->loadNoteRelations($note->refresh()),
        ]);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        if (! $this->belongsToCurrentUser($note, $request)) {
            return $this->forbiddenResponse();
        }

        DB::transaction(function () use ($note): void {
            $note->tags()->detach();
            $note->delete();
        });

        return $this->successResponse('Xóa ghi chú thành công.');
    }

    public function togglePin(Request $request, Note $note): JsonResponse
    {
        if (! $this->belongsToCurrentUser($note, $request)) {
            return $this->forbiddenResponse();
        }

        $note->update([
            'is_pinned' => ! $note->is_pinned,
        ]);

        return $this->successResponse('Cập nhật trạng thái ghim ghi chú thành công.', [
            'note' => [
                'id' => $note->id,
                'title' => $note->title,
                'is_pinned' => $note->is_pinned,
            ],
        ]);
    }

    private function rules(): array
    {
        return [
            'subject_id' => ['nullable', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'is_pinned' => ['nullable', 'boolean'],
            'visibility' => ['nullable', Rule::in(['private', 'public'])],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer'],
        ];
    }

    private function belongsToCurrentUser(Note $note, Request $request): bool
    {
        return $note->user_id === $request->user()->id;
    }

    private function validSubject(int $subjectId, int $userId): bool
    {
        return Subject::where('id', $subjectId)
            ->where('user_id', $userId)
            ->exists();
    }

    private function validTag(int $tagId, int $userId): bool
    {
        return Tag::where('id', $tagId)
            ->where('user_id', $userId)
            ->exists();
    }

    private function validTags(array $tagIds, int $userId): bool
    {
        return Tag::where('user_id', $userId)
            ->whereIn('id', $tagIds)
            ->count() === count($tagIds);
    }

    private function uniqueTagIds(array $tagIds): array
    {
        return array_values(array_unique(array_map('intval', $tagIds)));
    }

    private function loadNoteRelations(Note $note): Note
    {
        return $note->load(['subject:id,name,code,color', 'tags:id,name,color']);
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
            'message' => 'Bạn không có quyền truy cập ghi chú này.',
        ], 403);
    }

    private function invalidSubjectResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Môn học không hợp lệ hoặc không thuộc tài khoản của bạn.',
        ], 422);
    }

    private function invalidTagResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Một hoặc nhiều tag không hợp lệ.',
        ], 422);
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
