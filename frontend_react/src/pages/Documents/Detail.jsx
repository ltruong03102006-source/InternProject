import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import documentApi from "../../api/documentApi";

function formatSize(size) {
  if (!size) return "0 KB";

  const kb = size / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

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

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadDocument = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await documentApi.getById(id);

      setDocumentData(
        response.data?.data?.document || null
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải thông tin tài liệu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await documentApi.download(id);

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download =
        documentData?.original_name || "document";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể tải tài liệu."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài liệu "${documentData.title}" không?`
    );

    if (!confirmed) return;

    try {
      await documentApi.remove(id);
      navigate("/documents");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa tài liệu."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw
          size={38}
          className="animate-spin text-indigo-600"
        />
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="space-y-6">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 font-semibold text-slate-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-600">
          {error || "Không tìm thấy tài liệu."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Download size={18} />
            {downloading ? "Đang tải..." : "Tải tài liệu"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={18} />
            Xóa tài liệu
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <FileText size={32} />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-slate-800">
              {documentData.title}
            </h1>

            <p className="mt-2 break-all text-slate-500">
              {documentData.original_name}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                {documentData.extension || "file"}
              </span>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {formatSize(documentData.file_size)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={20}
                className="text-indigo-600"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Ngày upload
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {formatDate(documentData.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <FileText
                size={20}
                className="text-emerald-600"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Loại file
                </p>

                <p className="mt-1 font-semibold uppercase text-slate-800">
                  {documentData.extension || "Không rõ"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {documentData.subject && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{
                  backgroundColor:
                    documentData.subject.color || "#6366f1",
                }}
              >
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Môn học
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {documentData.subject.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-7 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-bold text-slate-800">
            Mô tả tài liệu
          </h2>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
            {documentData.description || "Không có mô tả."}
          </p>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-bold text-slate-800">
            Thông tin kỹ thuật
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col justify-between gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row">
              <span className="text-slate-500">Tên file gốc</span>
              <span className="break-all font-semibold text-slate-800">
                {documentData.original_name}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row">
              <span className="text-slate-500">MIME type</span>
              <span className="font-semibold text-slate-800">
                {documentData.mime_type || "Không xác định"}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row">
              <span className="text-slate-500">Kích thước</span>
              <span className="font-semibold text-slate-800">
                {formatSize(documentData.file_size)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DocumentDetail;