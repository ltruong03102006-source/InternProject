<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tạo bảng tài liệu học tập.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // Người upload tài liệu
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Tài liệu có thể thuộc môn học hoặc không
            $table->foreignId('subject_id')
                ->nullable()
                ->constrained('subjects')
                ->nullOnDelete();

            $table->string('title'); // Tiêu đề tài liệu
            $table->text('description')->nullable(); // Mô tả tài liệu

            // Đường dẫn file trong storage
            $table->string('file_path');

            // Tên file gốc khi upload
            $table->string('original_name');

            // Loại mime, ví dụ: application/pdf
            $table->string('mime_type')->nullable();

            // Đuôi file, ví dụ: pdf, docx, pptx
            $table->string('extension', 20)->nullable();

            // Dung lượng file tính bằng byte
            $table->unsignedBigInteger('file_size')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'subject_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Xóa bảng tài liệu.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};