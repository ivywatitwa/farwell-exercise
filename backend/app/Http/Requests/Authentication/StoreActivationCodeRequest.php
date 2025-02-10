<?php

namespace App\Http\Requests\Authentication;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivationCodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|string|email|exists:users',
            'activation_code' => 'required|string|size:6',
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'No account found with this email',
            'activation_code.size' => 'Activation code must be 6 characters',
        ];
    }
}
