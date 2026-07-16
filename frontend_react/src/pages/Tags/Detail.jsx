import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Pencil,
  Pin,
  RefreshCw,
  Tag,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";
import tagApi from "../../api/tagApi";

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

function shortenText(text, maximumLength = 140) {
  if (!text) {
    return "Không có nội dung.";
  }

  return text.length > maximumLength
    ? `${text.slice(0, maximumLength)}...`
    : text;
}

function TagDetail() {
  const { id } = useParams();

  const [tag, setTag] = useState(null);
  const [notes, setNotes] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 6,
    total: 0,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTagDetail = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const [tagResponse, notesResponse] =
        await Promise.all([
          tagApi.getById(id),
          tagApi.getNotes(id, {
            page,
            per_page: pagination.per_page,
          }),
        ]);

      setTag(tagResponse.data?.data?.tag || null);
      setNotes(notesResponse.data?.data?.notes || []);

      setPagination(
        notesResponse.data?.data?.pagination || {
          current_page: 1,
          per_page: 6,
          total: 0,
          last_page: 1,
        }
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin tag."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTagDetail(1);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={38}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-4 text-slate-600">
            Đang tải thông tin tag...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="space-y-6">
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 font-semibold text-slate-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
          <p className="text-red-600">
            {error || "Không tìm thấy tag."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <Link
          to={`/tags/${tag.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          <Pencil size={18} />
          Cập nhật tag
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
              style={{
                backgroundColor: tag.color || "#6c757d",
              }}
            >
              <Tag size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {tag.name}
              </h1>

              <p className="mt-1 text-slate-500">
                {tag.notes_count || 0} ghi chú đang sử dụng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <span
              className="h-8 w-8 rounded-lg border border-slate-200"
              style={{
                backgroundColor: tag.color || "#6c757d",
              }}
            />

            <code className="font-semibold text-slate-600">
              {tag.color || "#6c757d"}
            </code>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={20}
                className="text-indigo-600"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Ngày tạo
                </p>

                <p className="font-semibold text-slate-800">
                  {formatDate(tag.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <RefreshCw
                size={20}
                className="text-emerald-600"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Cập nhật gần nhất
                </p>

                <p className="font-semibold text-slate-800">
                  {formatDate(tag.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Ghi chú thuộc tag
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Các ghi chú đang được gắn nhãn “{tag.name}”.
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <FileText
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-600">
              Chưa có ghi chú nào
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-800">
                      {note.title}
                    </h3>

                    {note.is_pinned && (
                      <Pin
                        size={18}
                        className="shrink-0 text-amber-500"
                      />
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {shortenText(note.content)}
                  </p>

                  {note.subject && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
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
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadTagDetail(
                    pagination.current_page - 1
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
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
                  pagination.current_page >=
                  pagination.last_page
                }
                onClick={() =>
                  loadTagDetail(
                    pagination.current_page + 1
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default TagDetail;