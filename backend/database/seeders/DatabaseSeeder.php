<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\ServiceDocumentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@jassi.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '9999999999',
        ]);

        // Staff user
        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@jassi.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'phone' => '8888888888',
        ]);

        // Customer user
        User::create([
            'name' => 'Test Customer',
            'email' => 'customer@jassi.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '7777777777',
        ]);

        // B2B user
        User::create([
            'name' => 'B2B Partner',
            'email' => 'b2b@jassi.com',
            'password' => Hash::make('password'),
            'role' => 'b2b',
            'phone' => '6666666666',
        ]);

        // Services
        $aadhaar = Service::create([
            'name' => 'Aadhaar Card',
            'slug' => 'aadhaar-card',
            'description' => 'Aadhaar Card new enrollment ya update service',
            'customer_price' => 500.00,
            'b2b_price' => 350.00,
            'estimated_days' => 15,
            'created_by' => 1,
        ]);
        ServiceDocumentType::insert([
            ['service_id' => $aadhaar->id, 'document_name' => 'Identity Proof', 'description' => 'Voter ID, Passport, etc.', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $aadhaar->id, 'document_name' => 'Address Proof', 'description' => 'Electricity Bill, Bank Passbook, etc.', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $aadhaar->id, 'document_name' => 'Date of Birth Proof', 'description' => 'Birth Certificate, 10th Certificate', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $aadhaar->id, 'document_name' => 'Passport Size Photo', 'description' => 'Recent passport size photograph', 'is_mandatory' => true, 'accepted_formats' => 'jpg,jpeg,png', 'max_size_mb' => 5, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $pan = Service::create([
            'name' => 'PAN Card',
            'slug' => 'pan-card',
            'description' => 'PAN Card application - new ya correction',
            'customer_price' => 300.00,
            'b2b_price' => 200.00,
            'estimated_days' => 10,
            'created_by' => 1,
        ]);
        ServiceDocumentType::insert([
            ['service_id' => $pan->id, 'document_name' => 'Identity Proof', 'description' => 'Aadhaar, Voter ID, etc.', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $pan->id, 'document_name' => 'Address Proof', 'description' => 'Aadhaar, Utility Bill, etc.', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $pan->id, 'document_name' => 'Date of Birth Proof', 'description' => 'Birth Certificate, Aadhaar, etc.', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $pan->id, 'document_name' => 'Passport Size Photo', 'description' => 'Recent photo', 'is_mandatory' => true, 'accepted_formats' => 'jpg,jpeg,png', 'max_size_mb' => 5, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $dl = Service::create([
            'name' => 'Driving License',
            'slug' => 'driving-license',
            'description' => 'New Driving License application',
            'customer_price' => 800.00,
            'b2b_price' => 600.00,
            'estimated_days' => 30,
            'created_by' => 1,
        ]);
        ServiceDocumentType::insert([
            ['service_id' => $dl->id, 'document_name' => 'Aadhaar Card', 'description' => 'Valid Aadhaar card copy', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $dl->id, 'document_name' => 'Address Proof', 'description' => 'Current address proof', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $dl->id, 'document_name' => 'Age Proof', 'description' => 'Birth Certificate ya 10th Marksheet', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $dl->id, 'document_name' => 'Passport Size Photos', 'description' => '2 recent photos', 'is_mandatory' => true, 'accepted_formats' => 'jpg,jpeg,png', 'max_size_mb' => 5, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['service_id' => $dl->id, 'document_name' => 'Learner License', 'description' => 'Valid LL copy', 'is_mandatory' => true, 'accepted_formats' => 'pdf,jpg,jpeg,png', 'max_size_mb' => 10, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
