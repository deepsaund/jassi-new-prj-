<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::where('is_active', true)->with('documentTypes');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $services = $query->paginate($request->input('per_page', 15));
        return response()->json($services);
    }

    public function show(int $id): JsonResponse
    {
        $service = Service::where('is_active', true)->with('documentTypes')->findOrFail($id);
        return response()->json(['data' => $service]);
    }
}
