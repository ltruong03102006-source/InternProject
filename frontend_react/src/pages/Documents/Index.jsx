import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import documentApi from "../../api/documentApi";
import subjectApi from "../../api/subjectApi";

function formatSize(size) {
  if (!size) return "0 KB";

  const kb = size / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function DocumentsIndex() {
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 9,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    subject_id: "",
    extension: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    try {
      const response = await subjectApi.getAll({
        per_page: 100,
      });

      setSubjects(response.data?.data?.subjects || []);
    } catch (error) {
      console.error("Load subjects error:", error);
    }
  };

  const loadDocuments = async (page = 1, customFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await documentApi.getAll({
        page,
        per_page: pagination.per_page,
        keyword: customFilters.keyword || undefined,
        subject_id: customFilters.subject_id || undefined,
        extension: customFilters.extension || undefined,
      });

      const paginator = response.data?.data?.documents;

      setDocuments(paginator?.data || []);

      setPagination({
        current_page: paginator?.current_page || 1,
        per_page: paginator?.per_page || 9,
        total: paginator?.total || 0,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error("Load documents error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách tài liệu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadDocuments(1);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadDocuments(1);
  };

  const handleReset = () => {
    const emptyFilters = {
      keyword: "",
      subject_id: "",
      extension: "",
    };

    setFilters(emptyFilters);
    loadDocuments(1, emptyFilters);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài liệu "${item.title}" không?`
    );

    if (!confirmed) return;

    try {
      await documentApi.remove(item.id);

      const nextPage =
        documents.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await loadDocuments(nextPage);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa tài liệu."
      );
    }
  };

  const handleDownload = async (item) => {
    try {
      const response = await documentApi.download(item.id);

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download = item.original_name || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể tải tài liệu."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Tài liệu học tập
          </h1>

          <p className="mt-2 text-slate-500">
            Lưu trữ và quản lý tài liệu phục vụ việc học.
          </p>
        </div>

        <Link
          to="/documents/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={19} />
          Upload tài liệu
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Tìm theo tiêu đề hoặc tên file..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              name="subject_id"
              value={filters.subject_id}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              <option value="">Tất cả môn học</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              name="extension"
              value={filters.extension}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              <option value="">Tất cả định dạng</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="docx">DOCX</option>
              <option value="ppt">PPT</option>
              <option value="pptx">PPTX</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
            >
              Xóa bộ lọc
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          Đang tải danh sách tài liệu...
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FileText
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Không có tài liệu
          </h2>

          <p className="mt-2 text-slate-500">
            Hãy upload tài liệu mới hoặc thay đổi bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                    <FileText size={24} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {item.extension || "file"}
                  </span>
                </div>

                <h2 className="mt-5 line-clamp-2 text-lg font-bold text-slate-800">
                  {item.title}
                </h2>

                <p className="mt-2 truncate text-sm text-slate-500">
                  {item.original_name}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {formatSize(item.file_size)}
                </p>

                {item.subject && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          item.subject.color || "#6366f1",
                      }}
                    />

                    {item.subject.name}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/documents/${item.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Eye size={15} />
                    Xem
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-2 text-xs font-semibold text-indigo-700"
                  >
                    <Download size={15} />
                    Tải
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-600"
                  >
                    <Trash2 size={15} />
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
            <p className="text-sm text-slate-500">
              Tổng cộng {pagination.total} tài liệu
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadDocuments(pagination.current_page - 1)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Trước
              </button>

              <span className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Trang {pagination.current_page}/{pagination.last_page}
              </span>

              <button
                type="button"
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  loadDocuments(pagination.current_page + 1)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DocumentsIndex;