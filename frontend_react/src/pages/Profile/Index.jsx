import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import profileApi from "../../api/profileApi";

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://127.0.0.1:8000";

function ProfileIndex() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    student_code: "",
    phone: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const avatarUrl = useMemo(() => {
    if (preview) {
      return preview;
    }

    if (!user?.avatar) {
      return "";
    }

    if (
      user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://")
    ) {
      return user.avatar;
    }

    return `${API_URL}/storage/${user.avatar}`;
  }, [preview, user]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await profileApi.me();
      const currentUser = response.data?.data?.user;

      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }

      setUser(currentUser);

      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        student_code: currentUser.student_code || "",
        phone: currentUser.phone || "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin cá nhân."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: null,
    }));

    setError("");
    setSuccess("");
  };

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFieldErrors((previous) => ({
        ...previous,
        avatar: ["Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP."],
      }));

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors((previous) => ({
        ...previous,
        avatar: ["Ảnh đại diện không được vượt quá 2 MB."],
      }));

      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));

    setFieldErrors((previous) => ({
      ...previous,
      avatar: null,
    }));

    setSuccess("");
    setError("");
  };

  const handleRemoveSelectedAvatar = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setAvatar(null);
    setPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim());
    formData.append("student_code", form.student_code.trim());
    formData.append("phone", form.phone.trim());

    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const response = await profileApi.update(formData);
      const updatedUser = response.data?.data?.user;

      if (updatedUser) {
        setUser(updatedUser);

        setForm({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          student_code: updatedUser.student_code || "",
          phone: updatedUser.phone || "",
        });

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }

      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setAvatar(null);
      setPreview("");

      setSuccess(
        response.data?.message ||
          "Cập nhật thông tin thành công."
      );
    } catch (error) {
      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Cập nhật thông tin thất bại."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Đang tải thông tin cá nhân...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              <ShieldCheck size={16} />
              Hồ sơ cá nhân
            </div>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              Quản lý tài khoản
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Cập nhật thông tin cá nhân, mã sinh viên, số điện thoại và
              ảnh đại diện của bạn.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-sm text-indigo-100">
              Trạng thái tài khoản
            </p>

            <div className="mt-2 flex items-center gap-2 font-semibold">
              <BadgeCheck size={20} />
              Đang hoạt động
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Có lỗi xảy ra</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Cập nhật thành công</p>
            <p className="mt-1 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-indigo-500 to-violet-500" />

            <div className="-mt-14 px-6 pb-6 text-center">
              <div className="relative mx-auto h-28 w-28">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "Ảnh đại diện"}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow-lg">
                    <UserRound size={46} />
                  </div>
                )}

                <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700">
                  <Camera size={17} />

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                {form.name || user?.name || "Người dùng"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {form.email || user?.email}
              </p>

              <span className="mt-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                {user?.role || "Student"}
              </span>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedAvatar}
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  <X size={16} />
                  Bỏ ảnh vừa chọn
                </button>
              )}

              {fieldErrors.avatar && (
                <p className="mt-3 text-sm text-red-600">
                  {fieldErrors.avatar[0]}
                </p>
              )}

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Hỗ trợ JPG, JPEG, PNG, WEBP. Kích thước tối đa 2 MB.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Thông tin nhanh
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {form.email || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Số điện thoại
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {form.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-bold text-slate-800">
              Thông tin cá nhân
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Điền đầy đủ thông tin để hồ sơ của bạn chính xác hơn.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Họ và tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                error={fieldErrors.name?.[0]}
                required
              />

              <Field
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
                error={fieldErrors.email?.[0]}
                required
              />

              <Field
                label="Mã sinh viên"
                name="student_code"
                value={form.student_code}
                onChange={handleChange}
                placeholder="Ví dụ: SV001234"
                error={fieldErrors.student_code?.[0]}
              />

              <Field
                label="Số điện thoại"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                error={fieldErrors.phone?.[0]}
              />
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="font-semibold text-blue-800">
                    Bảo mật thông tin
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Email được sử dụng để đăng nhập và nhận thông báo.
                    Hãy bảo đảm địa chỉ email luôn chính xác.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm text-slate-500">
              Các thay đổi chỉ được lưu sau khi nhấn nút bên cạnh.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-100"
        }`}
      />

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle size={15} />
          {error}
        </p>
      )}
    </div>
  );
}

export default ProfileIndex;