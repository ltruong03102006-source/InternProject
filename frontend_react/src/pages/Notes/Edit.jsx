import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Save,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import noteApi from "../../api/noteApi";
import subjectApi from "../../api/subjectApi";
import tagApi from "../../api/tagApi";

function NoteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject_id: "",
    title: "",
    content: "",
    is_pinned: false,
    visibility: "private",
    tag_ids: [],
  });

  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadData = async () => {
    setLoadingData(true);
    setError("");

    try {
      const [noteResponse, subjectResponse, tagResponse] =
        await Promise.all([
          noteApi.getById(id),
          subjectApi.getAll({ per_page: 100 }),
          tagApi.getAll({ per_page: 100 }),
        ]);

      const note = noteResponse.data?.data?.note;

      if (!note) {
        setError("Không tìm thấy ghi chú.");
        return;
      }

      setSubjects(subjectResponse.data?.data?.subjects || []);
      setTags(tagResponse.data?.data?.tags || []);

      setForm({
        subject_id: note.subject_id || "",
        title: note.title || "",
        content: note.content || "",
        is_pinned: Boolean(note.is_pinned),
        visibility: note.visibility || "private",
        tag_ids: note.tags?.map((tag) => tag.id) || [],
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin ghi chú."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");

    setFieldErrors((previous) => ({
      ...previous,
      [name]: null,
    }));
  };

  const handleTagChange = (tagId) => {
    setForm((previous) => {
      const selected = previous.tag_ids.includes(tagId);

      return {
        ...previous,
        tag_ids: selected
          ? previous.tag_ids.filter((item) => item !== tagId)
          : [...previous.tag_ids, tagId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const payload = {
      ...form,
      subject_id: form.subject_id
        ? Number(form.subject_id)
        : null,
    };

    try {
      const response = await noteApi.update(id, payload);

      alert(
        response.data?.message ||
          "Cập nhật ghi chú thành công."
      );

      navigate(`/notes/${id}`);
    } catch (error) {
      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể cập nhật ghi chú."
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

          <p className="mt-4 text-slate-600">
            Đang tải ghi chú...
          </p>
        </div>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="space-y-6">
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 font-semibold text-slate-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/notes/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại chi tiết
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Cập nhật ghi chú
        </h1>

        <p className="mt-2 text-slate-500">
          Chỉnh sửa nội dung và phân loại ghi chú.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tiêu đề <span className="text-red-500">*</span>
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-4 ${
              fieldErrors.title
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
            required
          />

          {fieldErrors.title && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.title[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Môn học
          </label>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Không thuộc môn học</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nội dung
          </label>

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows="12"
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Tag
          </p>

          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const selected = form.tag_ids.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagChange(tag.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    selected
                      ? "text-white"
                      : "bg-white text-slate-600"
                  }`}
                  style={{
                    backgroundColor: selected
                      ? tag.color
                      : undefined,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Quyền riêng tư
            </label>

            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="private">Riêng tư</option>
              <option value="public">Công khai</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
              <input
                type="checkbox"
                name="is_pinned"
                checked={form.is_pinned}
                onChange={handleChange}
                className="h-5 w-5"
              />

              <span className="font-semibold text-slate-700">
                Ghim ghi chú
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to={`/notes/${id}`}
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

export default NoteEdit;