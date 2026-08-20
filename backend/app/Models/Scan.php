<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'crop',
        'disease_name',
        'scientific_name',
        'confidence',
        'status',
        'image_url',
        'symptoms',
        'organic_remedy',
        'chemical_remedy',
    ];

    protected $casts = [
        'symptoms' => 'array',
    ];
}
