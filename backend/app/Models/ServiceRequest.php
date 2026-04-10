<?php

namespace App\Models;

use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = [
        'tracking_id', 'service_id', 'customer_id', 'created_by', 'claimed_by',
        'claimed_at', 'status', 'price_charged', 'delivery_type', 'is_on_behalf',
        'output_file_path', 'notes', 'completed_at',
    ];

    protected $casts = [
        'status' => RequestStatus::class,
        'price_charged' => 'decimal:2',
        'is_on_behalf' => 'boolean',
        'claimed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function claimedByUser()
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }

    public function documents()
    {
        return $this->hasMany(RequestDocument::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(RequestStatusHistory::class)->orderBy('created_at');
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public static function generateTrackingId(): string
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return sprintf('SR-%s-%04d', $date, $count);
    }
}
