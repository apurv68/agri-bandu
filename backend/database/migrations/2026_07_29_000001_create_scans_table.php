<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable();
            $table->string('user_name')->default('Guest Farmer');
            $table->string('crop');
            $table->string('disease_name');
            $table->string('scientific_name')->nullable();
            $table->float('confidence')->default(95.0);
            $table->string('status')->default('warning');
            $table->string('image_url');
            $table->text('symptoms')->nullable();
            $table->text('organic_remedy')->nullable();
            $table->text('chemical_remedy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scans');
    }
};
