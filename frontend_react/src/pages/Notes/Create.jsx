import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import noteApi from "../../api/noteApi";
import subjectApi from "../../api/subjectApi";
import tagApi from "../../api/tagApi";

function NoteCreate() {
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
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadOptions = async () => {
    setLoadingOptions(true);

    try {
      const [subjectResponse, tagResponse] = await Promise.all([
        subjectApi.getAll({ per_page: 100 }),
        tagApi.getAll({ per_page: 100 }),
      ]);

      setSubjects(subjectResponse.data?.data?.subjects || []);
      setTags(tagResponse.data?.data?.tags || []);
    } catch (error) {
      setError("Không thể tải danh sách môn học hoặc tag.");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

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
          ? previous.tag_ids.filter((id) => id !== tagId)
          : [...previous.tag_ids, tagId],
      };
    });

    setFieldErrors((previous) => ({
      ...previous,
      tag_ids: null,
    }));
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
      const response = await noteApi.create(payload);
      const note = response.data?.data?.note;

      alert(
        response.data?.message ||
          "Thêm ghi chú thành công."
      );

      navigate(note?.id ? `/notes/${note.id}` : "/notes");
    } catch (error) {
      console.error("Create note error:", error);

      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể thêm ghi chú."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/notes"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Thêm ghi chú
        </h1>

        <p className="mt-2 text-slate-500">
          Tạo ghi chú học tập mới.
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
            placeholder="Nhập tiêu đề ghi chú"
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
            disabled={loadingOptions}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Không thuộc môn học</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {fieldErrors.subject_id && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.subject_id[0]}
            </p>
          )}
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
            placeholder="Nhập nội dung ghi chú..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          {fieldErrors.content && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.content[0]}
            </p>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Tag
          </p>

          {loadingOptions ? (
            <p className="text-sm text-slate-500">
              Đang tải danh sách tag...
            </p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có tag. Bạn có thể tạo tag tại trang quản lý tag.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => {
                const selected = form.tag_ids.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagChange(tag.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
          )}

          {fieldErrors.tag_ids && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.tag_ids[0]}
            </p>
          )}
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
            to="/notes"
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
            {submitting ? "Đang lưu..." : "Lưu ghi chú"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteCreate;