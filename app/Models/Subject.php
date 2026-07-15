<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'teacher_name',
        'description',
        'color',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function deadlines()
    {
        return $this->hasMany(Deadline::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
