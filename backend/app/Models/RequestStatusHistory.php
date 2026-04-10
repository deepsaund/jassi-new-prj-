<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestStatusHistory extends Model
{
    public $timestamps = false;

    protected $table = 'request_status_history';

    protected $fillable = [
        'service_request_id', 'from_status', 'to_status', 'changed_by', 'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function changer()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
