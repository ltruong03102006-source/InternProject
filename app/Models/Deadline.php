<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deadline extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'subject_id',
        'title',
        'description',
        'type',
        'due_at',
        'priority',
        'status',
        'completed_at',
        'remind_at',
        'is_notified',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
        'remind_at' => 'datetime',
        'is_notified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
