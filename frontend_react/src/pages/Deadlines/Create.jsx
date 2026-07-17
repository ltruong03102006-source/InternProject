import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import deadlineApi from "../../api/deadlineApi";
import subjectApi from "../../api/subjectApi";

function DeadlineCreate() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject_id: "",
    type: "assignment",
    due_at: "",
    priority: "medium",
    status: "pending",
    remind_at: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await subjectApi.getAll({ per_page: 100 });
        setSubjects(response.data?.data?.subjects || []);
      } catch {
        setError("Không thể tải danh sách môn học.");
      }
    };

    loadSubjects();
  }, []);

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

    const payload = {
      ...form,
      subject_id: form.subject_id
        ? Number(form.subject_id)
        : null,
      remind_at: form.remind_at || null,
    };

    try {
      const response = await deadlineApi.create(payload);
      const deadline = response.data?.data?.deadline;

      alert(
        response.data?.message ||
          "Tạo deadline thành công."
      );

      navigate(
        deadline?.id
          ? `/deadlines/${deadline.id}`
          : "/deadlines"
      );
    } catch (error) {
      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể tạo deadline."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/deadlines"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Thêm deadline
        </h1>

        <p className="mt-2 text-slate-500">
          Tạo thời hạn mới cho công việc học tập.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block font-semibold text-slate-700">
            Tiêu đề *
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-100"
            required
          />

          {fieldErrors.title && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.title[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-semibold text-slate-700">
            Mô tả
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-slate-700">
            Môn học
          </label>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Không thuộc môn học</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Loại *
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="assignment">Bài tập</option>
              <option value="exam">Kiểm tra / Thi</option>
              <option value="presentation">Thuyết trình</option>
              <option value="project">Đồ án</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Mức ưu tiên *
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Thời hạn *
            </label>

            <input
              type="datetime-local"
              name="due_at"
              value={form.due_at}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Nhắc trước
            </label>

            <input
              type="datetime-local"
              name="remind_at"
              value={form.remind_at}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Trạng thái *
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="pending">Chờ thực hiện</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            to="/deadlines"
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Hủy
          </Link>

          <button
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Đang lưu..." : "Lưu deadline"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeadlineCreate;