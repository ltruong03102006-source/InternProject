import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Eye,
  Pencil,
  Pin,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import noteApi from "../../api/noteApi";

function formatDate(dateString) {
  if (!dateString) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function NoteDetail() {
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinLoading, setPinLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNote = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await noteApi.getById(id);
      setNote(response.data?.data?.note || null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin ghi chú."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote();
  }, [id]);

  const handleTogglePin = async () => {
    setPinLoading(true);

    try {
      await noteApi.togglePin(id);
      await loadNote();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái ghim."
      );
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
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

  if (error || !note) {
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
          <p className="text-red-600">
            {error || "Không tìm thấy ghi chú."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleTogglePin}
            disabled={pinLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold ${
              note.is_pinned
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            <Pin
              size={18}
              fill={note.is_pinned ? "currentColor" : "none"}
            />

            {note.is_pinned ? "Bỏ ghim" : "Ghim"}
          </button>

          <Link
            to={`/notes/${note.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            <Pencil size={18} />
            Cập nhật ghi chú
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-slate-800">
                {note.title}
              </h1>

              {note.is_pinned && (
                <Pin
                  size={22}
                  fill="currentColor"
                  className="mt-2 shrink-0 text-amber-500"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={17} />
                {formatDate(note.created_at)}
              </span>

              <span className="inline-flex items-center gap-2">
                <Eye size={17} />
                {note.visibility === "public"
                  ? "Công khai"
                  : "Riêng tư"}
              </span>
            </div>
          </div>

          {note.subject && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{
                  backgroundColor:
                    note.subject.color || "#6366f1",
                }}
              >
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Môn học
                </p>

                <p className="font-semibold text-slate-800">
                  {note.subject.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {note.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-white"
                style={{
                  backgroundColor: tag.color || "#64748b",
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-7 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-bold text-slate-800">
            Nội dung ghi chú
          </h2>

          <div className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-5 leading-8 text-slate-700">
            {note.content || "Ghi chú chưa có nội dung."}
          </div>
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-200 pt-7 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Ngày tạo
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {formatDate(note.created_at)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Cập nhật gần nhất
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {formatDate(note.updated_at)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NoteDetail;