<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
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

        Note::create([
            'user_id' => $student1->id,
            'subject_id' => $web->id,
            'title' => 'Tổng quan về Laravel MVC',
            'content' => 'Laravel sử dụng mô hình MVC gồm Model, View và Controller. Model xử lý dữ liệu, View hiển thị giao diện, Controller xử lý logic điều hướng.',
            'is_pinned' => true,
            'visibility' => 'private',
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        Note::create([
            'user_id' => $student1->id,
            'subject_id' => $web->id,
            'title' => 'Các lệnh Artisan thường dùng',
            'content' => 'Một số lệnh thường dùng: php artisan serve, php artisan migrate, php artisan make:model, php artisan make:controller, php artisan make:migration.',
            'is_pinned' => false,
            'visibility' => 'private',
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        Note::create([
            'user_id' => $student1->id,
            'subject_id' => $database->id,
            'title' => 'Khóa chính và khóa ngoại trong MySQL',
            'content' => 'Khóa chính dùng để định danh duy nhất một bản ghi. Khóa ngoại dùng để liên kết dữ liệu giữa các bảng.',
            'is_pinned' => true,
            'visibility' => 'private',
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Note::create([
            'user_id' => $student1->id,
            'subject_id' => $systemAnalysis->id,
            'title' => 'Các bước phân tích hệ thống',
            'content' => 'Các bước gồm khảo sát hiện trạng, xác định yêu cầu, phân tích chức năng, thiết kế cơ sở dữ liệu, thiết kế giao diện và triển khai hệ thống.',
            'is_pinned' => false,
            'visibility' => 'private',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Note::create([
            'user_id' => $student2->id,
            'subject_id' => $ui->id,
            'title' => 'Nguyên tắc thiết kế giao diện',
            'content' => 'Giao diện cần rõ ràng, dễ sử dụng, màu sắc thống nhất và tương thích với nhiều kích thước màn hình.',
            'is_pinned' => false,
            'visibility' => 'private',
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);
    }
}