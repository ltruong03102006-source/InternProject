<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng ghi chú.
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();

            // Người tạo ghi chú
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Ghi chú có thể thuộc một môn học.
            // Nếu môn học bị xóa, ghi chú vẫn còn nhưng subject_id = null.
            $table->foreignId('subject_id')
                ->nullable()
                ->constrained('subjects')
                ->nullOnDelete();

            $table->string('title'); // Tiêu đề ghi chú
            $table->longText('content')->nullable(); // Nội dung ghi chú

            // Ghim ghi chú quan trọng
            $table->boolean('is_pinned')->default(false);

            // private: riêng tư, public: có thể mở rộng chia sẻ sau này
            $table->string('visibility', 20)->default('private');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'subject_id']);
            $table->index(['user_id', 'is_pinned']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Xóa bảng ghi chú.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
