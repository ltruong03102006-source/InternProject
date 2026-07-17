import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import subjectApi from "../../api/subjectApi";

function SubjectCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher_name: "",
    description: "",
    color: "#4f46e5",
    status: "active",
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
      const response = await subjectApi.create(form);

      alert(
        response.data?.message ||
          "Thêm môn học thành công."
      );

      navigate("/subjects");
    } catch (error) {
      console.error("Create subject error:", error);

      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể thêm môn học."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Thêm môn học
        </h1>

        <p className="mt-2 text-slate-500">
          Nhập thông tin môn học mới.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Tên môn học <span className="text-red-500">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ví dụ: Lập trình Web"
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
              htmlFor="code"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Mã môn học
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              placeholder="Ví dụ: WEB101"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${
                fieldErrors.code
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />

            {fieldErrors.code && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.code[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="teacher_name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Giảng viên
            </label>

            <input
              id="teacher_name"
              name="teacher_name"
              type="text"
              value={form.teacher_name}
              onChange={handleChange}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${
                fieldErrors.teacher_name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />

            {fieldErrors.teacher_name && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.teacher_name[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="color"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Màu đại diện
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
                type="text"
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

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Trạng thái
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="active">Hoạt động</option>
              <option value="archived">Lưu trữ</option>
            </select>

            {fieldErrors.status && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.status[0]}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Mô tả
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              placeholder="Nhập mô tả ngắn về môn học..."
              className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${
                fieldErrors.description
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />

            {fieldErrors.description && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/subjects"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Đang lưu..." : "Lưu môn học"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubjectCreate;