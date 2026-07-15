<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng trung gian giữa notes và tags.
     */
    public function up(): void
    {
        Schema::create('note_tag', function (Blueprint $table) {
            $table->id();

            $table->foreignId('note_id')
                ->constrained('notes')
                ->cascadeOnDelete();

            $table->foreignId('tag_id')
                ->constrained('tags')
                ->cascadeOnDelete();

            $table->timestamps();

            // Một tag không được gắn trùng nhiều lần vào cùng một ghi chú
            $table->unique(['note_id', 'tag_id']);
        });
    }

    /**
     * Xóa bảng trung gian.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_tag');
    }
};