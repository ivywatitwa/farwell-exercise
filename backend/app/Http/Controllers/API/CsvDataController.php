<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use League\Csv\Reader;
use App\Models\CsvData;
use App\Http\Controllers\Controller; 
use Illuminate\Support\Facades\Validator;


class CsvDataController extends Controller
{

    public function upload(Request $request)
    {
        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'csv_data' => 'required|file|mimes:csv,txt|max:2048', // Limit file to 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Store the file
            $file = $request->file('csv_data');
            $filePath = $file->store('uploads', 'public');

            // Process the file (optional, e.g., reading CSV content)
            // $data = array_map('str_getcsv', file(storage_path('app/public/' . $filePath)));

            return response()->json([
                'message' => 'File uploaded successfully!',
                'file_path' => $filePath,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'File upload failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getData()
    {
        // Get data from cache or database with 5-minute TTL
        return Cache::remember('csv_data', 300, function () {
            return CsvData::all();
        });
    }
}

