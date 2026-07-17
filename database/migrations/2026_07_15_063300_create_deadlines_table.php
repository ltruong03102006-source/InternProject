<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng deadline học tập.
     */
    public function up(): void
    {
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();

            // Người tạo deadline
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Deadline có thể thuộc môn học hoặc không
            $table->foreignId('subject_id')
                ->nullable()
                ->constrained('subjects')
                ->nullOnDelete();

            $table->string('title'); // Tên deadline
            $table->text('description')->nullable(); // Mô tả deadline

            // Loại deadline: assignment, exam, presentation, project, other
            $table->string('type', 30)->default('assignment');

            // Thời hạn nộp/làm
            $table->dateTime('due_at');

            // Mức ưu tiên: low, medium, high
            $table->string('priority', 20)->default('medium');

            // Trạng thái: pending, in_progress, completed, cancelled
            $table->string('status', 30)->default('pending');

            // Thời điểm hoàn thành
            $table->dateTime('completed_at')->nullable();

            // Thời điểm nhắc nhở, nếu sau này làm thông báo
            $table->dateTime('remind_at')->nullable();

            // Đánh dấu đã gửi thông báo hay chưa
            $table->boolean('is_notified')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'subject_id']);
            $table->index(['user_id', 'due_at']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'priority']);
        });
    }

    /**
     * Xóa bảng deadline.
     */
    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
