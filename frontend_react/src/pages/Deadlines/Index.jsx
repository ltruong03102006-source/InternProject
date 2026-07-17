import { useEffect, useState } from "react";
import {
  CalendarClock,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import deadlineApi from "../../api/deadlineApi";
import subjectApi from "../../api/subjectApi";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ thực hiện" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const priorityOptions = [
  { value: "", label: "Tất cả mức ưu tiên" },
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
];

const typeOptions = [
  { value: "", label: "Tất cả loại" },
  { value: "assignment", label: "Bài tập" },
  { value: "exam", label: "Kiểm tra / Thi" },
  { value: "presentation", label: "Thuyết trình" },
  { value: "project", label: "Đồ án" },
  { value: "other", label: "Khác" },
];

function formatDate(dateString) {
  if (!dateString) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function getStatusLabel(status) {
  return (
    {
      pending: "Chờ thực hiện",
      in_progress: "Đang thực hiện",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
    }[status] || status
  );
}

function getStatusClass(status) {
  return (
    {
      pending: "bg-amber-100 text-amber-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-slate-200 text-slate-600",
    }[status] || "bg-slate-100 text-slate-600"
  );
}

function getPriorityLabel(priority) {
  return (
    {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
    }[priority] || priority
  );
}

function getPriorityClass(priority) {
  return (
    {
      low: "bg-emerald-100 text-emerald-700",
      medium: "bg-orange-100 text-orange-700",
      high: "bg-red-100 text-red-700",
    }[priority] || "bg-slate-100 text-slate-600"
  );
}

function getTypeLabel(type) {
  return (
    {
      assignment: "Bài tập",
      exam: "Kiểm tra / Thi",
      presentation: "Thuyết trình",
      project: "Đồ án",
      other: "Khác",
    }[type] || type
  );
}

function isOverdue(deadline) {
  return (
    new Date(deadline.due_at) < new Date() &&
    !["completed", "cancelled"].includes(deadline.status)
  );
}

function DeadlinesIndex() {
  const [deadlines, setDeadlines] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 6,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    subject_id: "",
    status: "",
    priority: "",
    type: "",
    from: "",
    to: "",
    overdue: false,
    upcoming: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    try {
      const response = await subjectApi.getAll({ per_page: 100 });
      setSubjects(response.data?.data?.subjects || []);
    } catch (error) {
      console.error("Load subjects error:", error);
    }
  };

  const loadDeadlines = async (page = 1, customFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await deadlineApi.getAll({
        page,
        per_page: pagination.per_page,
        keyword: customFilters.keyword || undefined,
        subject_id: customFilters.subject_id || undefined,
        status: customFilters.status || undefined,
        priority: customFilters.priority || undefined,
        type: customFilters.type || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
        overdue: customFilters.overdue ? 1 : undefined,
        upcoming: customFilters.upcoming ? 1 : undefined,
      });

      const paginator = response.data?.data?.deadlines;

      setDeadlines(paginator?.data || []);

      setPagination({
        current_page: paginator?.current_page || 1,
        per_page: paginator?.per_page || 6,
        total: paginator?.total || 0,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error("Load deadlines error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách deadline."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadDeadlines(1);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadDeadlines(1);
  };

  const handleReset = () => {
    const emptyFilters = {
      keyword: "",
      subject_id: "",
      status: "",
      priority: "",
      type: "",
      from: "",
      to: "",
      overdue: false,
      upcoming: false,
    };

    setFilters(emptyFilters);
    loadDeadlines(1, emptyFilters);
  };

  const handleStatusChange = async (deadline, status) => {
    try {
      await deadlineApi.updateStatus(deadline.id, status);
      await loadDeadlines(pagination.current_page);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái deadline."
      );
    }
  };

  const handleDelete = async (deadline) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa deadline "${deadline.title}" không?`
    );

    if (!confirmed) return;

    try {
      await deadlineApi.remove(deadline.id);

      const nextPage =
        deadlines.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await loadDeadlines(nextPage);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa deadline."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý deadline
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi bài tập, kỳ thi, đồ án và công việc học tập.
          </p>
        </div>

        <Link
          to="/deadlines/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={19} />
          Thêm deadline
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
              placeholder="Tìm kiếm theo tiêu đề..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              name="priority"
              value={filters.priority}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              {priorityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              {typeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Từ ngày
              </label>

              <input
                type="datetime-local"
                name="from"
                value={filters.from}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Đến ngày
              </label>

              <input
                type="datetime-local"
                name="to"
                value={filters.to}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="overdue"
                checked={filters.overdue}
                onChange={handleChange}
              />
              Chỉ hiển thị quá hạn
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="upcoming"
                checked={filters.upcoming}
                onChange={handleChange}
              />
              Trong 7 ngày tới
            </label>
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
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          Đang tải danh sách deadline...
        </div>
      ) : deadlines.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <CalendarClock
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Không có deadline
          </h2>

          <p className="mt-2 text-slate-500">
            Hãy thêm deadline mới hoặc thay đổi bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {deadlines.map((deadline) => (
              <article
                key={deadline.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  isOverdue(deadline)
                    ? "border-red-300"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-800">
                      {deadline.title}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {getTypeLabel(deadline.type)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                      deadline.priority
                    )}`}
                  >
                    {getPriorityLabel(deadline.priority)}
                  </span>
                </div>

                {deadline.subject && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          deadline.subject.color || "#6366f1",
                      }}
                    />

                    {deadline.subject.name}
                  </div>
                )}

                <div
                  className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
                    isOverdue(deadline)
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  Hạn: {formatDate(deadline.due_at)}
                  {isOverdue(deadline) && " — Đã quá hạn"}
                </div>

                <div className="mt-4">
                  <select
                    value={deadline.status}
                    onChange={(event) =>
                      handleStatusChange(
                        deadline,
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border-0 px-3 py-2 text-sm font-semibold outline-none ${getStatusClass(
                      deadline.status
                    )}`}
                  >
                    {statusOptions
                      .filter((item) => item.value)
                      .map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/deadlines/${deadline.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Eye size={15} />
                    Xem
                  </Link>

                  <Link
                    to={`/deadlines/${deadline.id}/edit`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-2 text-xs font-semibold text-indigo-700"
                  >
                    <Pencil size={15} />
                    Sửa
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(deadline)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-600"
                  >
                    <Trash2 size={15} />
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm sm:flex-row">
            <p className="text-sm text-slate-500">
              Tổng cộng {pagination.total} deadline
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadDeadlines(pagination.current_page - 1)
                }
                className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Trước
              </button>

              <span className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Trang {pagination.current_page}/
                {pagination.last_page}
              </span>

              <button
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  loadDeadlines(pagination.current_page + 1)
                }
                className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
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

export default DeadlinesIndex;