<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng nhãn ghi chú.
     */
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();

            // Mỗi sinh viên có bộ tag riêng
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name'); // Tên tag
            $table->string('color', 20)->default('#6c757d'); // Màu tag

            $table->timestamps();

            // Một sinh viên không tạo trùng tên tag
            $table->unique(['user_id', 'name']);

            $table->index('user_id');
        });
    }

    /**
     * Xóa bảng tag.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};