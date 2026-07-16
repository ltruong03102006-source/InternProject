import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Tag,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import tagApi from "../../api/tagApi";

function TagEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    color: "#6366f1",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadTag = async () => {
    setLoadingData(true);
    setError("");

    try {
      const response = await tagApi.getById(id);
      const tag = response.data?.data?.tag;

      if (!tag) {
        setError("Không tìm thấy tag.");
        return;
      }

      setForm({
        name: tag.name || "",
        color: tag.color || "#6366f1",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin tag."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadTag();
  }, [id]);

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

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await tagApi.update(id, form);

      alert(
        response.data?.message ||
          "Cập nhật tag thành công."
      );

      navigate(`/tags/${id}`);
    } catch (error) {
      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể cập nhật tag."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={38}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 font-medium text-slate-600">
            Đang tải thông tin tag...
          </p>
        </div>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="space-y-6">
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <p className="text-red-600">{error}</p>

          <button
            type="button"
            onClick={loadTag}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/tags/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại chi tiết
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Cập nhật tag
        </h1>

        <p className="mt-2 text-slate-500">
          Chỉnh sửa tên và màu của tag.
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tên tag <span className="text-red-500">*</span>
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${
              fieldErrors.name
                ? "border-red-400 focus:ring-red-100"
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Màu tag
          </label>

          <div className="flex items-center gap-3">
            <input
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
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
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
            to={`/tags/${id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save size={18} />
            {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TagEdit;