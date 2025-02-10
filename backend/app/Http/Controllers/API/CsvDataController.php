<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use League\Csv\Reader;
use App\Models\CsvData;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CsvDataController extends Controller
{

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_data' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('csv_data');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('uploads', $filename, 'public');

            // Store the file path in the database
            $csvData = new CsvData();
            $csvData->file_path = $filePath;
            $csvData->save();

            // Clear the cache after processing to ensure updated data.
            Cache::forget('csv_data');

            return response()->json([
                'message' => 'File uploaded and reference stored successfully!',
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
        return Cache::remember('csv_data', 300, function () {
            return CsvData::all();
        });
    }

    public function clearCache()
    {
        Cache::forget('csv_data');
        return response()->json(['message' => 'Cache cleared successfully.']);
    }

    public function show($id)
    {
        $cacheKey = 'csv_data_' . $id;

        return Cache::remember($cacheKey, 300, function () use ($id) {
            $data = CsvData::find($id);

            if (!$data) {
                return response()->json(['message' => 'Data not found.'], 404);
            }

            return $data;
        });
    }
    public function getCsvContent($id)
    {
        $csvData = CsvData::find($id);

        if (!$csvData) {
            return response()->json(['message' => 'Data not found.'], 404);
        }

        $filePath = $csvData->file_path;

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        try {
            $fileContent = Storage::disk('public')->get($filePath);

            $encoding = mb_detect_encoding($fileContent, 'UTF-8, ISO-8859-1, Windows-1252', true);

            if ($encoding && $encoding !== 'UTF-8') {
                $fileContent = mb_convert_encoding($fileContent, 'UTF-8', $encoding);
            }

            $csv = Reader::createFromString($fileContent);
            $csv->setHeaderOffset(0);
            $header = $csv->getHeader();
            $records = $csv->getRecords();
            $result = [];
            foreach ($records as $record) {
                $result[] = $record;
            }

            return response()->json([
                'header' => $header,
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error reading CSV file.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
