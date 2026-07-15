<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng môn học.
     */
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();

            // Mỗi môn học thuộc về một sinh viên
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name'); // Tên môn học
            $table->string('code', 50)->nullable(); // Mã môn học
            $table->string('teacher_name')->nullable(); // Tên giảng viên
            $table->text('description')->nullable(); // Mô tả môn học

            // Màu đại diện môn học, dùng cho giao diện
            $table->string('color', 20)->default('#0d6efd');

            // active: đang học, archived: đã lưu trữ
            $table->string('status', 20)->default('active');

            $table->timestamps();
            $table->softDeletes();

            // Một sinh viên không nên tạo trùng tên môn học
            $table->unique(['user_id', 'name']);

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Xóa bảng môn học.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};