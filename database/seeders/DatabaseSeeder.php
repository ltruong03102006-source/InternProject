<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::table('note_tag')->truncate();
        DB::table('documents')->truncate();
        DB::table('deadlines')->truncate();
        DB::table('notes')->truncate();
        DB::table('tags')->truncate();
        DB::table('subjects')->truncate();
        DB::table('users')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

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
