import { useState } from "react";
import { ArrowLeft, Save, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import tagApi from "../../api/tagApi";

function TagCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    color: "#6366f1",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    setFieldErrors((previous) => ({
      ...previous,
      [name]: null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await tagApi.create(form);

      alert(
        response.data?.message ||
          "Thêm tag thành công."
      );

      navigate("/tags");
    } catch (error) {
      console.error("Create tag error:", error);

      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể thêm tag."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/tags"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Thêm tag
        </h1>

        <p className="mt-2 text-slate-500">
          Tạo nhãn mới để phân loại ghi chú.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
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
            Tên tag <span className="text-red-500">*</span>
          </label>

          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Quan trọng"
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${
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
            htmlFor="color"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Màu tag
          </label>

          <div className="flex items-center gap-3">
            <input
              id="color"
              name="color"
              type="color"
              value={form.color}
              onChange={handleChange}
              className="h-12 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
            />

            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {fieldErrors.color && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.color[0]}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Xem trước
          </p>

          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: form.color }}
            >
              <Tag size={21} />
            </div>

            <span
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: form.color }}
            >
              {form.name || "Tên tag"}
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/tags"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Đang lưu..." : "Lưu tag"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TagCreate;