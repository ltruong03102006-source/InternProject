<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('subject:id,name,code,color')->where('user_id', $request->user()->id);
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(fn ($q) => $q->where('title', 'like', "%{$keyword}%")->orWhere('original_name', 'like', "%{$keyword}%"));
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('extension')) {
            $query->where('extension', $request->extension);
        }

        return response()->json(['success' => true, 'data' => ['documents' => $query->latest()->paginate(min((int) $request->input('per_page', 10), 100))]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'subject_id' => ['nullable', 'integer'], 'file' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png']]);
        if (($data['subject_id'] ?? null) && ! Subject::whereKey($data['subject_id'])->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Môn học không hợp lệ.'], 422);
        }
        $file = $request->file('file');
        $path = $file->store('documents/'.$request->user()->id, 'local');
        $document = Document::create(['user_id' => $request->user()->id, 'subject_id' => $data['subject_id'] ?? null, 'title' => $data['title'], 'description' => $data['description'] ?? null, 'file_path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType(), 'extension' => strtolower($file->getClientOriginalExtension()), 'file_size' => $file->getSize()]);

        return response()->json(['success' => true, 'message' => 'Upload tài liệu thành công.', 'data' => ['document' => $document->load('subject:id,name,code,color')]], 201);
    }

    public function show(Request $request, Document $document): JsonResponse
    {
        if ($document->user_id !== $request->user()->id) {
            return $this->forbidden();
        }

        return response()->json(['success' => true, 'data' => ['document' => $document->load('subject:id,name,code,color')]]);
    }

    public function download(Request $request, Document $document): StreamedResponse|JsonResponse
    {
        if ($document->user_id !== $request->user()->id) {
            return $this->forbidden();
        }
        abort_unless(Storage::disk('local')->exists($document->file_path), 404, 'Không tìm thấy file.');

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        if ($document->user_id !== $request->user()->id) {
            return $this->forbidden();
        }
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(['success' => true, 'message' => 'Xóa tài liệu thành công.']);
    }

    private function forbidden(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Bạn không có quyền truy cập tài liệu này.'], 403);
    }
}
