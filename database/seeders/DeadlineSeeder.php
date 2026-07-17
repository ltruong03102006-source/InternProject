<?php

namespace Database\Seeders;

use App\Models\Deadline;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class DeadlineSeeder extends Seeder
{
    public function run(): void
    {
        $student1 = User::where('email', 'student1@example.com')->first();
        $student2 = User::where('email', 'student2@example.com')->first();

        $web = Subject::where('user_id', $student1->id)
            ->where('code', 'WEB101')
            ->first();

        $database = Subject::where('user_id', $student1->id)
            ->where('code', 'DB102')
            ->first();

        $systemAnalysis = Subject::where('user_id', $student1->id)
            ->where('code', 'SA201')
            ->first();

        $ui = Subject::where('user_id', $student2->id)
            ->where('code', 'UI101')
            ->first();

        Deadline::create([
            'user_id' => $student1->id,
            'subject_id' => $web->id,
            'title' => 'Nộp bài CRUD Laravel',
            'description' => 'Hoàn thành chức năng thêm, sửa, xóa, xem danh sách môn học và ghi chú.',
            'type' => 'assignment',
            'due_at' => now()->addDays(2),
            'priority' => 'high',
            'status' => 'in_progress',
            'completed_at' => null,
            'remind_at' => now()->addDay(),
            'is_notified' => false,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Deadline::create([
            'user_id' => $student1->id,
            'subject_id' => $database->id,
            'title' => 'Ôn tập kiểm tra SQL',
            'description' => 'Ôn SELECT, JOIN, GROUP BY, ORDER BY và các ràng buộc khóa ngoại.',
            'type' => 'exam',
            'due_at' => now()->addDays(5),
            'priority' => 'medium',
            'status' => 'pending',
            'completed_at' => null,
            'remind_at' => now()->addDays(4),
            'is_notified' => false,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Deadline::create([
            'user_id' => $student1->id,
            'subject_id' => $systemAnalysis->id,
            'title' => 'Hoàn thành tài liệu phân tích chức năng',
            'description' => 'Viết đầy đủ mô tả chức năng, luồng xử lý, bảng dữ liệu và phân quyền người dùng.',
            'type' => 'project',
            'due_at' => now()->subDay(),
            'priority' => 'high',
            'status' => 'pending',
            'completed_at' => null,
            'remind_at' => now()->subDays(2),
            'is_notified' => true,
            'created_at' => now()->subDays(6),
            'updated_at' => now()->subDays(6),
        ]);

        Deadline::create([
            'user_id' => $student1->id,
            'subject_id' => $web->id,
            'title' => 'Làm slide thuyết trình Laravel',
            'description' => 'Chuẩn bị slide giới thiệu đề tài, chức năng, database và demo hệ thống.',
            'type' => 'presentation',
            'due_at' => now()->addDays(10),
            'priority' => 'low',
            'status' => 'pending',
            'completed_at' => null,
            'remind_at' => now()->addDays(8),
            'is_notified' => false,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        Deadline::create([
            'user_id' => $student2->id,
            'subject_id' => $ui->id,
            'title' => 'Thiết kế giao diện Dashboard',
            'description' => 'Thiết kế giao diện dashboard bằng Bootstrap hoặc Tailwind CSS.',
            'type' => 'assignment',
            'due_at' => now()->addDays(3),
            'priority' => 'medium',
            'status' => 'completed',
            'completed_at' => now()->subHours(5),
            'remind_at' => now()->addDays(2),
            'is_notified' => false,
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subHours(5),
        ]);
    }
}
