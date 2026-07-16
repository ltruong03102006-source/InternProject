<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
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

        Document::create([
            'user_id' => $student1->id,
            'subject_id' => $web->id,
            'title' => 'Slide bài giảng Laravel cơ bản',
            'description' => 'Tài liệu giới thiệu Laravel, route, controller, model và migration.',
            'file_path' => 'documents/laravel-co-ban.pdf',
            'original_name' => 'laravel-co-ban.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'file_size' => 1200000,
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        Document::create([
            'user_id' => $student1->id,
            'subject_id' => $database->id,
            'title' => 'Bài tập thực hành MySQL',
            'description' => 'Danh sách bài tập truy vấn SQL.',
            'file_path' => 'documents/bai-tap-mysql.docx',
            'original_name' => 'bai-tap-mysql.docx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'extension' => 'docx',
            'file_size' => 850000,
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        Document::create([
            'user_id' => $student1->id,
            'subject_id' => $systemAnalysis->id,
            'title' => 'Mẫu báo cáo phân tích hệ thống',
            'description' => 'File mẫu dùng để viết báo cáo phân tích chức năng.',
            'file_path' => 'documents/mau-bao-cao-phan-tich.pptx',
            'original_name' => 'mau-bao-cao-phan-tich.pptx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'extension' => 'pptx',
            'file_size' => 2300000,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Document::create([
            'user_id' => $student2->id,
            'subject_id' => $ui->id,
            'title' => 'Tài liệu Tailwind CSS',
            'description' => 'Ghi chú về các class Tailwind CSS thường dùng.',
            'file_path' => 'documents/tailwind-css.pdf',
            'original_name' => 'tailwind-css.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'file_size' => 1500000,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);
    }
}
