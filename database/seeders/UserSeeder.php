<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Quản trị viên',
            'email' => 'admin@example.com',
            'student_code' => null,
            'phone' => '0900000000',
            'avatar' => null,
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'status' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Nguyễn Văn An',
            'email' => 'student1@example.com',
            'student_code' => 'SV001',
            'phone' => '0911111111',
            'avatar' => null,
            'password' => Hash::make('12345678'),
            'role' => 'student',
            'status' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Trần Thị Bình',
            'email' => 'student2@example.com',
            'student_code' => 'SV002',
            'phone' => '0922222222',
            'avatar' => null,
            'password' => Hash::make('12345678'),
            'role' => 'student',
            'status' => true,
            'email_verified_at' => now(),
        ]);
    }
}