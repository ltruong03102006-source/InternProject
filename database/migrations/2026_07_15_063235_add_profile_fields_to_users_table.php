<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Thêm thông tin hồ sơ và phân quyền cho tài khoản.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('student_code', 50)->nullable()->unique()->after('email');
            $table->string('phone', 20)->nullable()->after('student_code');
            $table->string('avatar')->nullable()->after('phone');

            // student: sinh viên, admin: quản trị viên
            $table->string('role', 20)->default('student')->after('password');

            // true: đang hoạt động, false: bị khóa
            $table->boolean('status')->default(true)->after('role');
        });
    }

    /**
     * Xóa các cột đã thêm nếu rollback.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['student_code']);
            $table->dropColumn([
                'student_code',
                'phone',
                'avatar',
                'role',
                'status',
            ]);
        });
    }
};
