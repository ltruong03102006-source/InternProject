<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $student1 = User::where('email', 'student1@example.com')->first();
        $student2 = User::where('email', 'student2@example.com')->first();

        Tag::create([
            'user_id' => $student1->id,
            'name' => 'Quan trọng',
            'color' => '#dc3545',
        ]);

        Tag::create([
            'user_id' => $student1->id,
            'name' => 'Ôn thi',
            'color' => '#ffc107',
        ]);

        Tag::create([
            'user_id' => $student1->id,
            'name' => 'Bài tập',
            'color' => '#0d6efd',
        ]);

        Tag::create([
            'user_id' => $student1->id,
            'name' => 'Cần xem lại',
            'color' => '#6f42c1',
        ]);

        Tag::create([
            'user_id' => $student2->id,
            'name' => 'Tài liệu tham khảo',
            'color' => '#20c997',
        ]);
    }
}
