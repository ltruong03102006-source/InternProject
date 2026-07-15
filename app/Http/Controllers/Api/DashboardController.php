<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use App\Models\Document;
use App\Models\Note;
use App\Models\Subject;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $now = now();

        $summary = [
            'total_subjects' => Subject::where('user_id', $userId)->count(),
            'total_notes' => Note::where('user_id', $userId)->count(),
            'total_deadlines' => Deadline::where('user_id', $userId)->count(),
            'total_documents' => Document::where('user_id', $userId)->count(),
            'total_tags' => Tag::where('user_id', $userId)->count(),
        ];

        $deadlineStats = [
            'pending' => Deadline::where('user_id', $userId)->where('status', 'pending')->count(),
            'in_progress' => Deadline::where('user_id', $userId)->where('status', 'in_progress')->count(),
            'completed' => Deadline::where('user_id', $userId)->where('status', 'completed')->count(),
            'cancelled' => Deadline::where('user_id', $userId)->where('status', 'cancelled')->count(),
            'overdue' => Deadline::where('user_id', $userId)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->where('due_at', '<', $now)
                ->count(),
            'upcoming' => Deadline::where('user_id', $userId)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereBetween('due_at', [$now, $now->copy()->addDays(7)])
                ->count(),
        ];

        $deadlinePriorityStats = [
            'low' => Deadline::where('user_id', $userId)->where('priority', 'low')->count(),
            'medium' => Deadline::where('user_id', $userId)->where('priority', 'medium')->count(),
            'high' => Deadline::where('user_id', $userId)->where('priority', 'high')->count(),
        ];

        $subjectColumns = 'id,name,code,color';

        $upcomingDeadlines = Deadline::with("subject:$subjectColumns")
            ->select('id', 'subject_id', 'title', 'description', 'type', 'due_at', 'priority', 'status')
            ->where('user_id', $userId)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where('due_at', '>=', $now)
            ->orderBy('due_at')
            ->limit(5)
            ->get();

        $latestNotes = Note::with("subject:$subjectColumns")
            ->select('id', 'subject_id', 'title', 'content', 'is_pinned', 'created_at')
            ->where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        $latestDocuments = Document::with("subject:$subjectColumns")
            ->select('id', 'subject_id', 'title', 'original_name', 'extension', 'file_size', 'created_at')
            ->where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        $pinnedNotes = Note::with("subject:$subjectColumns")
            ->select('id', 'subject_id', 'title', 'content', 'is_pinned', 'created_at')
            ->where('user_id', $userId)
            ->where('is_pinned', true)
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy dữ liệu dashboard thành công.',
            'data' => [
                'summary' => $summary,
                'deadline_stats' => $deadlineStats,
                'deadline_priority_stats' => $deadlinePriorityStats,
                'deadline_status_stats' => [
                    'pending' => $deadlineStats['pending'],
                    'in_progress' => $deadlineStats['in_progress'],
                    'completed' => $deadlineStats['completed'],
                    'cancelled' => $deadlineStats['cancelled'],
                ],
                'upcoming_deadlines' => $upcomingDeadlines,
                'latest_notes' => $latestNotes,
                'latest_documents' => $latestDocuments,
                'pinned_notes' => $pinnedNotes,
            ],
        ]);
    }
}
