import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileUp,
  Upload,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import documentApi from "../../api/documentApi";
import subjectApi from "../../api/subjectApi";

function DocumentCreate() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject_id: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await subjectApi.getAll({
          per_page: 100,
        });

        setSubjects(response.data?.data?.subjects || []);
      } catch (error) {
        setError("Không thể tải danh sách môn học.");
      } finally {
        setLoadingSubjects(false);
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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);

    setFieldErrors((previous) => ({
      ...previous,
      file: null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (!selectedFile) {
      setFieldErrors({
        file: ["Vui lòng chọn tài liệu cần upload."],
      });

      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFieldErrors({
        file: ["Kích thước file không được vượt quá 10 MB."],
      });

      return;
    }

    setSubmitting(true);

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);

    if (form.subject_id) {
      formData.append("subject_id", form.subject_id);
    }

    formData.append("file", selectedFile);

    try {
      const response = await documentApi.create(formData);
      const uploadedDocument = response.data?.data?.document;

      alert(
        response.data?.message ||
          "Upload tài liệu thành công."
      );

      navigate(
        uploadedDocument?.id
          ? `/documents/${uploadedDocument.id}`
          : "/documents"
      );
    } catch (error) {
      console.error("Upload document error:", error);

      if (error.response?.status === 422) {
        setFieldErrors(error.response?.data?.errors || {});
      }

      setError(
        error.response?.data?.message ||
          "Không thể upload tài liệu."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Upload tài liệu
        </h1>

        <p className="mt-2 text-slate-500">
          Tải tài liệu học tập lên hệ thống.
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tiêu đề tài liệu <span className="text-red-500">*</span>
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ví dụ: Slide bài giảng Laravel"
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
            disabled={loadingSubjects}
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
            Mô tả
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            placeholder="Mô tả ngắn về nội dung tài liệu..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          {fieldErrors.description && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            File tài liệu <span className="text-red-500">*</span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
            <FileUp size={42} className="text-indigo-500" />

            <p className="mt-4 font-semibold text-slate-700">
              Chọn file từ máy tính
            </p>

            <p className="mt-2 text-sm text-slate-500">
              PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG hoặc PNG
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Kích thước tối đa 10 MB
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <div className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Đã chọn: <strong>{selectedFile.name}</strong>
            </div>
          )}

          {fieldErrors.file && (
            <p className="mt-2 text-sm text-red-600">
              {fieldErrors.file[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/documents"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={18} />
            {submitting ? "Đang upload..." : "Upload tài liệu"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocumentCreate;