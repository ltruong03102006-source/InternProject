<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'student_code' => ['nullable', 'string', 'max:50', 'unique:users,student_code'],
                'phone' => ['nullable', 'string', 'max:20'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(
                'Dữ liệu đăng ký không hợp lệ.',
                422,
                ['errors' => $exception->errors()]
            );
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'student_code' => $validated['student_code'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'role' => 'student',
            'status' => true,
        ]);

        return $this->successResponse('Đăng ký tài khoản thành công.', [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(
                'Dữ liệu đăng nhập không hợp lệ.',
                422,
                ['errors' => $exception->errors()]
            );
        }

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse('Email hoặc mật khẩu không đúng.', 401);
        }

        if (! $user->status) {
            return $this->errorResponse('Tài khoản đã bị khóa.', 403);
        }

        return $this->successResponse('Đăng nhập thành công.', [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse('Lấy thông tin người dùng thành công.', [
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse('Đăng xuất thành công.');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->successResponse('Đã đăng xuất khỏi tất cả thiết bị.');
    }

    private function successResponse(string $message, array $data = [], int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== []) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    private function errorResponse(string $message, int $status, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => false,
            'message' => $message,
        ], $extra), $status);
    }
}
