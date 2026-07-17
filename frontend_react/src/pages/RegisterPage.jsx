import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");

    setFieldErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      setFieldErrors({
        password_confirmation: ["Mật khẩu xác nhận không khớp."],
      });

      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(form);

      console.log("Register response:", response);

      alert(
        response?.message ||
          "Đăng ký thành công. Vui lòng đăng nhập."
      );

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);

      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            N
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Tạo tài khoản
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quản lý ghi chú và deadline học tập
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Họ và tên
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition focus:ring-4 ${
                fieldErrors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
              required
            />

            {fieldErrors.name && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition focus:ring-4 ${
                fieldErrors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
              required
            />

            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Mật khẩu
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition focus:ring-4 ${
                fieldErrors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
              required
            />

            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Xác nhận mật khẩu
            </label>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition focus:ring-4 ${
                fieldErrors.password_confirmation
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
              required
            />

            {fieldErrors.password_confirmation && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.password_confirmation[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;