import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderOpen,
  Pin,
  RefreshCw,
  Tags,
} from "lucide-react";
import { dashboardApi } from "../api/dashboardApi";

function formatDate(dateString) {
  if (!dateString) {
    return "Chưa có thời hạn";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function shortenText(text, maximumLength = 100) {
  if (!text) {
    return "Không có nội dung";
  }

  if (text.length <= maximumLength) {
    return text;
  }

  return `${text.slice(0, maximumLength)}...`;
}

function getPriorityLabel(priority) {
  const labels = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
  };

  return labels[priority] || priority;
}

function getPriorityClass(priority) {
  const classes = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };

  return classes[priority] || "bg-slate-100 text-slate-700";
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await dashboardApi.getDashboard();

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải dữ liệu dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={40}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 font-medium text-slate-600">
            Đang tải dữ liệu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle size={32} />
          </div>

          <h1 className="mt-6 text-xl font-bold text-slate-800">
            Không thể tải dashboard
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const deadlineStats = dashboard?.deadline_stats || {};
  const priorityStats = dashboard?.deadline_priority_stats || {};
  const upcomingDeadlines = dashboard?.upcoming_deadlines || [];
  const latestNotes = dashboard?.latest_notes || [];
  const latestDocuments = dashboard?.latest_documents || [];
  const pinnedNotes = dashboard?.pinned_notes || [];

  const statistics = [
    {
      title: "Môn học",
      value: summary.total_subjects || 0,
      description: "Tổng số môn học",
      icon: BookOpen,
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      title: "Ghi chú",
      value: summary.total_notes || 0,
      description: "Tổng số ghi chú",
      icon: FileText,
      iconClass: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Deadline sắp tới",
      value: deadlineStats.upcoming || 0,
      description: "Trong 7 ngày tới",
      icon: CalendarClock,
      iconClass: "bg-orange-100 text-orange-600",
    },
    {
      title: "Đã hoàn thành",
      value: deadlineStats.completed || 0,
      description: "Deadline đã xử lý",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Theo dõi tổng quan ghi chú, môn học và deadline của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-800">
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Deadline sắp tới
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Năm công việc có thời hạn gần nhất.
            </p>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
              <CalendarClock size={42} className="text-slate-300" />

              <p className="mt-4 font-semibold text-slate-600">
                Chưa có deadline sắp tới
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Deadline mới sẽ được hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <article
                  key={deadline.id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800">
                          {deadline.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
                            deadline.priority
                          )}`}
                        >
                          {getPriorityLabel(deadline.priority)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {shortenText(deadline.description)}
                      </p>

                      {deadline.subject && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
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
                    </div>

                    <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                      {formatDate(deadline.due_at)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Tổng quan hệ thống
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Thống kê nhanh dữ liệu học tập.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">
                  Ghi chú
                </span>
              </div>

              <strong>{summary.total_notes || 0}</strong>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <Pin size={20} className="text-amber-600" />
                <span className="text-sm font-medium text-slate-700">
                  Đã ghim
                </span>
              </div>

              <strong>{pinnedNotes.length}</strong>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <Tags size={20} className="text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">
                  Tag
                </span>
              </div>

              <strong>{summary.total_tags || 0}</strong>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <FolderOpen size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Tài liệu
                </span>
              </div>

              <strong>{summary.total_documents || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Ghi chú gần đây
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Những ghi chú mới được tạo gần nhất.
          </p>

          {latestNotes.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chưa có ghi chú nào.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {latestNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-800">
                      {note.title}
                    </h3>

                    {note.is_pinned && (
                      <Pin
                        size={17}
                        className="shrink-0 text-amber-500"
                      />
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {shortenText(note.content)}
                  </p>

                  {note.subject && (
                    <p className="mt-3 text-xs font-medium text-indigo-600">
                      {note.subject.name}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Thống kê deadline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Phân loại theo trạng thái và mức ưu tiên.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Chờ thực hiện</p>
              <strong className="mt-2 block text-2xl text-amber-800">
                {deadlineStats.pending || 0}
              </strong>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Đang thực hiện</p>
              <strong className="mt-2 block text-2xl text-blue-800">
                {deadlineStats.in_progress || 0}
              </strong>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Quá hạn</p>
              <strong className="mt-2 block text-2xl text-red-800">
                {deadlineStats.overdue || 0}
              </strong>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Hoàn thành</p>
              <strong className="mt-2 block text-2xl text-emerald-800">
                {deadlineStats.completed || 0}
              </strong>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Theo mức ưu tiên
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Cao</span>
                <strong>{priorityStats.high || 0}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Trung bình</span>
                <strong>{priorityStats.medium || 0}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thấp</span>
                <strong>{priorityStats.low || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;