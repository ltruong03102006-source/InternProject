import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import deadlineApi from "../../api/deadlineApi";
import subjectApi from "../../api/subjectApi";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function DeadlineEdit() {
  const { id } = useParams();
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

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deadlineResponse, subjectResponse] =
          await Promise.all([
            deadlineApi.getById(id),
            subjectApi.getAll({ per_page: 100 }),
          ]);

        const deadline =
          deadlineResponse.data?.data?.deadline;

        setSubjects(
          subjectResponse.data?.data?.subjects || []
        );

        if (!deadline) {
          setError("Không tìm thấy deadline.");
          return;
        }

        setForm({
          title: deadline.title || "",
          description: deadline.description || "",
          subject_id: deadline.subject_id || "",
          type: deadline.type || "assignment",
          due_at: toDateTimeLocal(deadline.due_at),
          priority: deadline.priority || "medium",
          status: deadline.status || "pending",
          remind_at: toDateTimeLocal(deadline.remind_at),
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Không thể tải deadline."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await deadlineApi.update(id, {
        ...form,
        subject_id: form.subject_id
          ? Number(form.subject_id)
          : null,
        remind_at: form.remind_at || null,
      });

      alert("Cập nhật deadline thành công.");
      navigate(`/deadlines/${id}`);
    } catch (error) {
      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể cập nhật deadline."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/deadlines/${id}`}
        className="inline-flex items-center gap-2 font-semibold text-slate-600"
      >
        <ArrowLeft size={18} />
        Quay lại chi tiết
      </Link>

      <h1 className="text-3xl font-bold text-slate-800">
        Cập nhật deadline
      </h1>

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
          <label className="mb-2 block font-semibold">Tiêu đề *</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          {fieldErrors.title && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.title[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-semibold">Mô tả</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Môn học</label>

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
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
          >
            <option value="assignment">Bài tập</option>
            <option value="exam">Kiểm tra / Thi</option>
            <option value="presentation">Thuyết trình</option>
            <option value="project">Đồ án</option>
            <option value="other">Khác</option>
          </select>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>

          <input
            type="datetime-local"
            name="due_at"
            value={form.due_at}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
            required
          />

          <input
            type="datetime-local"
            name="remind_at"
            value={form.remind_at}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
          >
            <option value="pending">Chờ thực hiện</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            to={`/deadlines/${id}`}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Hủy
          </Link>

          <button
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            <Save size={18} />
            {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeadlineEdit;