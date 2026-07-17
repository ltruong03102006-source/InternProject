<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        foreach (['note_tag', 'documents', 'deadlines', 'notes', 'tags', 'subjects', 'users'] as $table) {
            DB::table($table)->delete();
        }
        Schema::enableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            SubjectSeeder::class,
            TagSeeder::class,
            NoteSeeder::class,
            DeadlineSeeder::class,
            DocumentSeeder::class,
            NoteTagSeeder::class,
        ]);
    }
}
