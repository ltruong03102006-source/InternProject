<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoteTagSeeder extends Seeder
{
    public function run(): void
    {
        $student1 = User::where('email', 'student1@example.com')->first();

        $important = Tag::where('user_id', $student1->id)
            ->where('name', 'Quan trọng')
            ->first();

        $exam = Tag::where('user_id', $student1->id)
            ->where('name', 'Ôn thi')
            ->first();

        $homework = Tag::where('user_id', $student1->id)
            ->where('name', 'Bài tập')
            ->first();

        $review = Tag::where('user_id', $student1->id)
            ->where('name', 'Cần xem lại')
            ->first();

        $noteLaravelMvc = Note::where('user_id', $student1->id)
            ->where('title', 'Tổng quan về Laravel MVC')
            ->first();

        $noteArtisan = Note::where('user_id', $student1->id)
            ->where('title', 'Các lệnh Artisan thường dùng')
            ->first();

        $noteMysql = Note::where('user_id', $student1->id)
            ->where('title', 'Khóa chính và khóa ngoại trong MySQL')
            ->first();

        $noteSystem = Note::where('user_id', $student1->id)
            ->where('title', 'Các bước phân tích hệ thống')
            ->first();

        $noteLaravelMvc->tags()->syncWithoutDetaching([
            $important->id,
            $exam->id,
        ]);

        $noteArtisan->tags()->syncWithoutDetaching([
            $homework->id,
        ]);

        $noteMysql->tags()->syncWithoutDetaching([
            $important->id,
            $review->id,
        ]);

        $noteSystem->tags()->syncWithoutDetaching([
            $homework->id,
        ]);
    }
}