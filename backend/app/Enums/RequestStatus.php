<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Submitted = 'submitted';
    case DocsUnderReview = 'docs_under_review';
    case DocsRejected = 'docs_rejected';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case PickupReady = 'pickup_ready';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
}
