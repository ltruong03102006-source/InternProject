import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Circle,
  Pencil,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import subjectApi from "../../api/subjectApi";

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

function SubjectDetail() {
  const { id } = useParams();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubject = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await subjectApi.getById(id);

      setSubject(response.data?.data?.subject || null);
    } catch (error) {
      console.error("Load subject detail error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin môn học."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={38}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 font-medium text-slate-600">
            Đang tải thông tin môn học...
          </p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="space-y-6">
        <Link
          to="/subjects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            Không thể tải môn học
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error || "Không tìm thấy môn học."}
          </p>

          <button
            type="button"
            onClick={loadSubject}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/subjects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <Link
          to={`/subjects/${subject.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Pencil size={18} />
          Cập nhật môn học
        </Link>
      </div>

      <section>
        <h1 className="text-3xl font-bold text-slate-800">
          Chi tiết môn học
        </h1>

        <p className="mt-2 text-slate-500">
          Xem đầy đủ thông tin môn học.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          className="h-3 w-full"
          style={{
            backgroundColor: subject.color || "#4f46e5",
          }}
        />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{
                  backgroundColor: subject.color || "#4f46e5",
                }}
              >
                <BookOpen size={28} />
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-800">
                  {subject.name}
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {subject.code || "Chưa có mã môn học"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                subject.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Circle
                size={10}
                fill="currentColor"
              />

              {subject.status === "active"
                ? "Đang hoạt động"
                : "Đã lưu trữ"}
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Giảng viên
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {subject.teacher_name || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                  <BookOpen size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Mã môn học
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {subject.code || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Ngày tạo
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(subject.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                  <RefreshCw size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Cập nhật gần nhất
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(subject.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-800">
              Mô tả môn học
            </h3>

            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {subject.description || "Môn học chưa có mô tả."}
            </p>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-800">
              Màu đại diện
            </h3>

            <div className="mt-3 flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-xl border border-slate-200"
                style={{
                  backgroundColor: subject.color || "#4f46e5",
                }}
              />

              <code className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                {subject.color || "#4f46e5"}
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SubjectDetail;