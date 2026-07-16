<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $student1 = User::where('email', 'student1@example.com')->first();
        $student2 = User::where('email', 'student2@example.com')->first();

        Subject::create([
            'user_id' => $student1->id,
            'name' => 'Lập trình Web',
            'code' => 'WEB101',
            'teacher_name' => 'Thầy Nguyễn Minh Hoàng',
            'description' => 'Môn học về HTML, CSS, JavaScript và Laravel cơ bản.',
            'color' => '#0d6efd',
            'status' => 'active',
        ]);

        Subject::create([
            'user_id' => $student1->id,
            'name' => 'Cơ sở dữ liệu',
            'code' => 'DB102',
            'teacher_name' => 'Cô Trần Lan Anh',
            'description' => 'Môn học về thiết kế cơ sở dữ liệu, SQL và MySQL.',
            'color' => '#198754',
            'status' => 'active',
        ]);

        Subject::create([
            'user_id' => $student1->id,
            'name' => 'Phân tích thiết kế hệ thống',
            'code' => 'SA201',
            'teacher_name' => 'Thầy Lê Quốc Bảo',
            'description' => 'Môn học về phân tích yêu cầu, thiết kế chức năng và mô hình hệ thống.',
            'color' => '#ffc107',
            'status' => 'active',
        ]);

        Subject::create([
            'user_id' => $student2->id,
            'name' => 'Thiết kế giao diện Web',
            'code' => 'UI101',
            'teacher_name' => 'Cô Phạm Thanh Mai',
            'description' => 'Môn học về UI/UX, Bootstrap và Tailwind CSS.',
            'color' => '#dc3545',
            'status' => 'active',
        ]);
    }
}
