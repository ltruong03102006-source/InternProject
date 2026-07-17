<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 && $perPage <= 100
            ? $perPage
            : 10;

        $query = Tag::withCount([
            'notes' => function (EloquentBuilder $query) use ($userId): void {
                $query->where('notes.user_id', $userId);
            },
        ])->where('user_id', $userId);

        if ($request->filled('keyword')) {
            $query->where('name', 'like', '%'.$request->query('keyword').'%');
        }

        $tags = $query
            ->latest()
            ->paginate($perPage);

        return $this->successResponse(
            'Lấy danh sách tag thành công.',
            [
                'tags' => $tags->items(),
                'pagination' => [
                    'current_page' => $tags->currentPage(),
                    'per_page' => $tags->perPage(),
                    'total' => $tags->total(),
                    'last_page' => $tags->lastPage(),
                ],
            ]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate(
                $this->rules($userId)
            );
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $tag = Tag::create([
            'user_id' => $userId,
            'name' => $validated['name'],
            'color' => $validated['color'] ?? '#6c757d',
        ]);

        return $this->successResponse(
            'Thêm tag thành công.',
            [
                'tag' => $tag,
            ],
            201
        );
    }

    public function show(
        Request $request,
        Tag $tag
    ): JsonResponse {
        $userId = $request->user()->id;

        if (! $this->belongsToCurrentUser($tag, $userId)) {
            return $this->forbiddenResponse();
        }

        $tag->loadCount([
            'notes' => function (EloquentBuilder $query) use ($userId): void {
                $query->where('notes.user_id', $userId);
            },
        ]);

        return $this->successResponse(
            'Lấy chi tiết tag thành công.',
            [
                'tag' => $tag,
            ]
        );
    }

    public function update(
        Request $request,
        Tag $tag
    ): JsonResponse {
        $userId = $request->user()->id;

        if (! $this->belongsToCurrentUser($tag, $userId)) {
            return $this->forbiddenResponse();
        }

        try {
            $validated = $request->validate(
                $this->rules($userId, $tag->id)
            );
        } catch (ValidationException $exception) {
            return $this->validationErrorResponse($exception);
        }

        $tag->update([
            'name' => $validated['name'],
            'color' => $validated['color'] ?? $tag->color,
        ]);

        return $this->successResponse(
            'Cập nhật tag thành công.',
            [
                'tag' => $tag->refresh(),
            ]
        );
    }

    public function destroy(
        Request $request,
        Tag $tag
    ): JsonResponse {
        if (! $this->belongsToCurrentUser(
            $tag,
            $request->user()->id
        )) {
            return $this->forbiddenResponse();
        }

        DB::transaction(function () use ($tag): void {
            $tag->notes()->detach();
            $tag->delete();
        });

        return $this->successResponse(
            'Xóa tag thành công.'
        );
    }

    public function notes(
        Request $request,
        Tag $tag
    ): JsonResponse {
        $userId = $request->user()->id;

        if (! $this->belongsToCurrentUser($tag, $userId)) {
            return $this->forbiddenResponse();
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 && $perPage <= 100
            ? $perPage
            : 10;

        $notes = $tag->notes()
            ->with([
                'subject:id,name,code,color',
                'tags:id,name,color',
            ])
            ->where('notes.user_id', $userId)
            ->orderByDesc('is_pinned')
            ->latest('notes.created_at')
            ->paginate($perPage);

        return $this->successResponse(
            'Lấy danh sách ghi chú theo tag thành công.',
            [
                'tag' => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                ],
                'notes' => $notes->items(),
                'pagination' => [
                    'current_page' => $notes->currentPage(),
                    'per_page' => $notes->perPage(),
                    'total' => $notes->total(),
                    'last_page' => $notes->lastPage(),
                ],
            ]
        );
    }

    private function rules(
        int $userId,
        ?int $ignoreTagId = null
    ): array {
        $uniqueName = Rule::unique('tags', 'name')
            ->where(function (QueryBuilder $query) use ($userId): void {
                $query->where('user_id', $userId);
            });

        if ($ignoreTagId !== null) {
            $uniqueName->ignore($ignoreTagId);
        }

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                $uniqueName,
            ],
            'color' => [
                'nullable',
                'string',
                'max:20',
            ],
        ];
    }

    private function belongsToCurrentUser(
        Tag $tag,
        int $userId
    ): bool {
        return (int) $tag->user_id === (int) $userId;
    }

    private function successResponse(
        string $message,
        array $data = [],
        int $status = 200
    ): JsonResponse {
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
            'message' => 'Bạn không có quyền truy cập tag này.',
        ], 403);
    }

    private function validationErrorResponse(
        ValidationException $exception
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $exception->errors(),
        ], 422);
    }
}
