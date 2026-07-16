<?php

namespace Tests\Feature;

use App\Models\Deadline;
use App\Models\Document;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RemainingFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_manage_only_their_deadlines(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $subject = Subject::create(['user_id' => $user->id, 'name' => 'Laravel', 'status' => 'active']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/deadlines', [
            'title' => 'Nộp đồ án', 'subject_id' => $subject->id, 'type' => 'project',
            'due_at' => now()->addDays(3)->toDateTimeString(), 'priority' => 'high', 'status' => 'pending',
        ])->assertCreated()->assertJsonPath('data.deadline.title', 'Nộp đồ án');

        $deadlineId = $response->json('data.deadline.id');
        $this->patchJson("/api/deadlines/{$deadlineId}/status", ['status' => 'completed'])
            ->assertOk()->assertJsonPath('data.deadline.status', 'completed');
        $this->assertNotNull(Deadline::find($deadlineId)->completed_at);

        $foreign = Deadline::create(['user_id' => $other->id, 'title' => 'Riêng tư', 'type' => 'other', 'due_at' => now(), 'priority' => 'low', 'status' => 'pending']);
        $this->getJson("/api/deadlines/{$foreign->id}")->assertForbidden();
    }

    public function test_student_can_upload_download_and_delete_document(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/documents', [
            'title' => 'Bài giảng', 'file' => UploadedFile::fake()->create('bai-giang.pdf', 100, 'application/pdf'),
        ])->assertCreated();

        $document = Document::findOrFail($response->json('data.document.id'));
        Storage::disk('local')->assertExists($document->file_path);
        $this->get("/api/documents/{$document->id}/download", ['Authorization' => 'Bearer test'])->assertOk();
        $this->deleteJson("/api/documents/{$document->id}")->assertOk();
        Storage::disk('local')->assertMissing($document->file_path);
    }

    public function test_profile_can_be_updated_and_student_cannot_access_admin(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/profile', ['name' => 'Nguyễn Văn A', 'email' => $user->email, 'student_code' => 'SV001'])
            ->assertOk()->assertJsonPath('data.user.student_code', 'SV001');
        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_view_statistics_and_lock_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.summary.users', 2);
        $this->patchJson("/api/admin/users/{$student->id}/status")->assertOk();
        $this->assertFalse((bool) $student->fresh()->status);
    }
}
