import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import deadlineApi from "../../api/deadlineApi";

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

function DeadlineDetail() {
  const { id } = useParams();

  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDeadline = async () => {
      try {
        const response = await deadlineApi.getById(id);
        setDeadline(response.data?.data?.deadline || null);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Không thể tải deadline."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDeadline();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !deadline) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-red-600">
        {error || "Không tìm thấy deadline."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <Link
          to="/deadlines"
          className="inline-flex items-center gap-2 font-semibold text-slate-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <Link
          to={`/deadlines/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          <Pencil size={18} />
          Cập nhật
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-100 p-4 text-indigo-600">
            <CalendarClock size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {deadline.title}
            </h1>

            <p className="mt-2 text-slate-500">
              Hạn: {formatDate(deadline.due_at)}
            </p>
          </div>
        </div>

        {deadline.subject && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <BookOpen size={20} />

            <span className="font-semibold">
              {deadline.subject.name}
            </span>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Loại</p>
            <p className="mt-1 font-semibold">{deadline.type}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Ưu tiên</p>
            <p className="mt-1 font-semibold">{deadline.priority}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Trạng thái</p>
            <p className="mt-1 font-semibold">{deadline.status}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Nhắc lúc</p>
            <p className="mt-1 font-semibold">
              {formatDate(deadline.remind_at)}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-bold">Mô tả</h2>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
            {deadline.description || "Không có mô tả."}
          </p>
        </div>
      </section>
    </div>
  );
}

export default DeadlineDetail;