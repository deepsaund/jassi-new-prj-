<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceDocumentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::with('documentTypes')->withCount('serviceRequests');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'customer_price' => 'required|numeric|min:0',
            'b2b_price' => 'required|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:1',
            'document_types' => 'required|array|min:1',
            'document_types.*.document_name' => 'required|string|max:255',
            'document_types.*.description' => 'nullable|string',
            'document_types.*.is_mandatory' => 'boolean',
            'document_types.*.accepted_formats' => 'nullable|string',
            'document_types.*.max_size_mb' => 'nullable|integer|min:1|max:50',
        ]);

        $service = Service::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'customer_price' => $validated['customer_price'],
            'b2b_price' => $validated['b2b_price'],
            'estimated_days' => $validated['estimated_days'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        foreach ($validated['document_types'] as $index => $docType) {
            ServiceDocumentType::create([
                'service_id' => $service->id,
                'document_name' => $docType['document_name'],
                'description' => $docType['description'] ?? null,
                'is_mandatory' => $docType['is_mandatory'] ?? true,
                'accepted_formats' => $docType['accepted_formats'] ?? 'pdf,jpg,jpeg,png',
                'max_size_mb' => $docType['max_size_mb'] ?? 10,
                'sort_order' => $index + 1,
            ]);
        }

        return response()->json([
            'data' => $service->load('documentTypes'),
            'message' => 'Service created successfully',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $service = Service::with('documentTypes')->withCount('serviceRequests')->findOrFail($id);
        return response()->json(['data' => $service]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'customer_price' => 'sometimes|numeric|min:0',
            'b2b_price' => 'sometimes|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'document_types' => 'sometimes|array|min:1',
            'document_types.*.id' => 'nullable|exists:service_document_types,id',
            'document_types.*.document_name' => 'required|string|max:255',
            'document_types.*.description' => 'nullable|string',
            'document_types.*.is_mandatory' => 'boolean',
            'document_types.*.accepted_formats' => 'nullable|string',
            'document_types.*.max_size_mb' => 'nullable|integer|min:1|max:50',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $service->update(collect($validated)->except('document_types')->toArray());

        if (isset($validated['document_types'])) {
            $existingIds = [];
            foreach ($validated['document_types'] as $index => $docType) {
                if (!empty($docType['id'])) {
                    ServiceDocumentType::where('id', $docType['id'])->update([
                        'document_name' => $docType['document_name'],
                        'description' => $docType['description'] ?? null,
                        'is_mandatory' => $docType['is_mandatory'] ?? true,
                        'accepted_formats' => $docType['accepted_formats'] ?? 'pdf,jpg,jpeg,png',
                        'max_size_mb' => $docType['max_size_mb'] ?? 10,
                        'sort_order' => $index + 1,
                    ]);
                    $existingIds[] = $docType['id'];
                } else {
                    $newDoc = ServiceDocumentType::create([
                        'service_id' => $service->id,
                        'document_name' => $docType['document_name'],
                        'description' => $docType['description'] ?? null,
                        'is_mandatory' => $docType['is_mandatory'] ?? true,
                        'accepted_formats' => $docType['accepted_formats'] ?? 'pdf,jpg,jpeg,png',
                        'max_size_mb' => $docType['max_size_mb'] ?? 10,
                        'sort_order' => $index + 1,
                    ]);
                    $existingIds[] = $newDoc->id;
                }
            }
            ServiceDocumentType::where('service_id', $service->id)->whereNotIn('id', $existingIds)->delete();
        }

        return response()->json([
            'data' => $service->load('documentTypes'),
            'message' => 'Service updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $service->update(['is_active' => false]);
        return response()->json(['message' => 'Service deactivated']);
    }
}
