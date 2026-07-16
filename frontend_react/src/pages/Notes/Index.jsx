import { useEffect, useState } from "react";
import {
  Eye,
  FileText,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import noteApi from "../../api/noteApi";
import subjectApi from "../../api/subjectApi";
import tagApi from "../../api/tagApi";

function shortenText(text, maximumLength = 150) {
  if (!text) {
    return "Không có nội dung.";
  }

  return text.length > maximumLength
    ? `${text.slice(0, maximumLength)}...`
    : text;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

function NotesIndex() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 6,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    subject_id: "",
    tag_id: "",
    is_pinned: "",
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFilterData = async () => {
    setFilterLoading(true);

    try {
      const [subjectResponse, tagResponse] = await Promise.all([
        subjectApi.getAll({ per_page: 100 }),
        tagApi.getAll({ per_page: 100 }),
      ]);

      setSubjects(subjectResponse.data?.data?.subjects || []);
      setTags(tagResponse.data?.data?.tags || []);
    } catch (error) {
      console.error("Load note filters error:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const loadNotes = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await noteApi.getAll({
        page,
        per_page: pagination.per_page,
        keyword: filters.keyword || undefined,
        subject_id: filters.subject_id || undefined,
        tag_id: filters.tag_id || undefined,
        is_pinned:
          filters.is_pinned === ""
            ? undefined
            : filters.is_pinned,
      });

      setNotes(response.data?.data?.notes || []);

      setPagination(
        response.data?.data?.pagination || {
          current_page: 1,
          per_page: 6,
          total: 0,
          last_page: 1,
        }
      );
    } catch (error) {
      console.error("Load notes error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách ghi chú."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterData();
    loadNotes(1);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadNotes(1);
  };

  const handleReset = () => {
    const emptyFilters = {
      keyword: "",
      subject_id: "",
      tag_id: "",
      is_pinned: "",
    };

    setFilters(emptyFilters);

    setTimeout(() => {
      loadNotes(1);
    }, 0);
  };

  const handleTogglePin = async (note) => {
    try {
      await noteApi.togglePin(note.id);
      await loadNotes(pagination.current_page);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái ghim."
      );
    }
  };

  const handleDelete = async (note) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ghi chú "${note.title}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await noteApi.remove(note.id);

      const nextPage =
        notes.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await loadNotes(nextPage);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa ghi chú."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý ghi chú
          </h1>

          <p className="mt-2 text-slate-500">
            Tạo, tìm kiếm và phân loại ghi chú học tập.
          </p>
        </div>

        <Link
          to="/notes/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={19} />
          Thêm ghi chú
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
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              name="subject_id"
              value={filters.subject_id}
              onChange={handleFilterChange}
              disabled={filterLoading}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Tất cả môn học</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              name="tag_id"
              value={filters.tag_id}
              onChange={handleFilterChange}
              disabled={filterLoading}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Tất cả tag</option>

              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <select
              name="is_pinned"
              value={filters.is_pinned}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Tất cả ghi chú</option>
              <option value="1">Đã ghim</option>
              <option value="0">Chưa ghim</option>
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
          Đang tải danh sách ghi chú...
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FileText
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Không có ghi chú
          </h2>

          <p className="mt-2 text-slate-500">
            Hãy tạo ghi chú mới hoặc thay đổi bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  note.is_pinned
                    ? "border-amber-300"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-800">
                      {note.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(note.created_at)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePin(note)}
                    title={note.is_pinned ? "Bỏ ghim" : "Ghim"}
                    className={`rounded-xl p-2 transition ${
                      note.is_pinned
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-400 hover:text-amber-500"
                    }`}
                  >
                    <Pin
                      size={19}
                      fill={note.is_pinned ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-500">
                  {shortenText(note.content)}
                </p>

                {note.subject && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          note.subject.color || "#6366f1",
                      }}
                    />

                    {note.subject.name}
                  </div>
                )}

                {note.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                        style={{
                          backgroundColor: tag.color || "#64748b",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/notes/${note.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Eye size={15} />
                    Xem
                  </Link>

                  <Link
                    to={`/notes/${note.id}/edit`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Pencil size={15} />
                    Sửa
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(note)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
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
              Tổng cộng {pagination.total} ghi chú
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadNotes(pagination.current_page - 1)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <span className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Trang {pagination.current_page}/
                {pagination.last_page}
              </span>

              <button
                type="button"
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  loadNotes(pagination.current_page + 1)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
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
export default NotesIndex;