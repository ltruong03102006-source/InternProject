<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'student_code' => ['nullable', 'string', 'max:50', Rule::unique('users', 'student_code')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }
        $user->update($data);

        return response()->json(['success' => true, 'message' => 'Cập nhật hồ sơ thành công.', 'data' => ['user' => $user->fresh()]]);
    }

    public function password(Request $request): JsonResponse
    {
        $data = $request->validate(['current_password' => ['required', 'current_password'], 'password' => ['required', 'string', 'min:8', 'confirmed']]);
        $request->user()->update(['password' => Hash::make($data['password'])]);

        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công.']);
    }
}
