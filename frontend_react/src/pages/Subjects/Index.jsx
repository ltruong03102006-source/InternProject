import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import subjectApi from "../../api/subjectApi";

function SubjectsIndex() {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 6,
    total: 0,
    last_page: 1,
  });

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubjects = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await subjectApi.getAll({
        page,
        per_page: pagination.per_page,
        keyword: keyword || undefined,
        status: status || undefined,
      });

      setSubjects(response.data.data.subjects || []);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Load subjects error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách môn học."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects(1);
  }, [status]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadSubjects(1);
  };

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa môn học "${subject.name}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await subjectApi.remove(subject.id);

      const nextPage =
        subjects.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await loadSubjects(nextPage);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa môn học."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý môn học
          </h1>

          <p className="mt-2 text-slate-500">
            Danh sách các môn học của bạn.
          </p>
        </div>

        <Link
          to="/subjects/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={19} />
          Thêm môn học
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên, mã môn hoặc giảng viên..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="archived">Lưu trữ</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-900"
          >
            Tìm kiếm
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          Đang tải danh sách môn học...
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            Không có môn học
          </h2>

          <p className="mt-2 text-slate-500">
            Hãy thêm môn học mới hoặc thay đổi bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-slate-800">
                      {subject.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {subject.code || "Chưa có mã môn"}
                    </p>
                  </div>

                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-slate-200"
                    style={{
                      backgroundColor: subject.color || "#6366f1",
                    }}
                  />
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Giảng viên:</span>{" "}
                    {subject.teacher_name || "Chưa cập nhật"}
                  </p>

                  <p>
                    <span className="font-semibold">Trạng thái:</span>{" "}
                    <span
                      className={
                        subject.status === "active"
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-slate-500"
                      }
                    >
                      {subject.status === "active"
                        ? "Hoạt động"
                        : "Lưu trữ"}
                    </span>
                  </p>

                  <p className="line-clamp-2">
                    <span className="font-semibold">Mô tả:</span>{" "}
                    {subject.description || "Không có mô tả"}
                  </p>
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/subjects/${subject.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Eye size={16} />
                    Xem
                  </Link>

                  <Link
                    to={`/subjects/${subject.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Pencil size={16} />
                    Sửa
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(subject)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
            <p className="text-sm text-slate-500">
              Tổng cộng {pagination.total} môn học
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadSubjects(pagination.current_page - 1)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                  loadSubjects(pagination.current_page + 1)
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

export default SubjectsIndex;