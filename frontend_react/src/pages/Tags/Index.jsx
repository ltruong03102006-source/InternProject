import { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import tagApi from "../../api/tagApi";

function TagsIndex() {
  const [tags, setTags] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 8,
    total: 0,
    last_page: 1,
  });

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTags = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await tagApi.getAll({
        page,
        per_page: pagination.per_page,
        keyword: keyword || undefined,
      });

      setTags(response.data?.data?.tags || []);

      setPagination(
        response.data?.data?.pagination || {
          current_page: 1,
          per_page: 8,
          total: 0,
          last_page: 1,
        }
      );
    } catch (error) {
      console.error("Load tags error:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách tag."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags(1);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadTags(1);
  };

  const handleDelete = async (tag) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tag "${tag.name}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await tagApi.remove(tag.id);

      alert(
        response.data?.message ||
          "Xóa tag thành công."
      );

      const nextPage =
        tags.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await loadTags(nextPage);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa tag."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý tag
          </h1>

          <p className="mt-2 text-slate-500">
            Quản lý các nhãn dùng để phân loại ghi chú.
          </p>
        </div>

        <Link
          to="/tags/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={19} />
          Thêm tag
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
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
              placeholder="Tìm kiếm theo tên tag..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
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
          Đang tải danh sách tag...
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Tag
            size={42}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Không có tag
          </h2>

          <p className="mt-2 text-slate-500">
            Hãy thêm tag mới hoặc thay đổi từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {tags.map((tag) => (
              <article
                key={tag.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{
                      backgroundColor: tag.color || "#6c757d",
                    }}
                  >
                    <Tag size={23} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {tag.notes_count || 0} ghi chú
                  </span>
                </div>

                <h2 className="mt-5 truncate text-lg font-bold text-slate-800">
                  {tag.name}
                </h2>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-slate-200"
                    style={{
                      backgroundColor: tag.color || "#6c757d",
                    }}
                  />

                  <code className="text-xs font-semibold text-slate-500">
                    {tag.color || "#6c757d"}
                  </code>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/tags/${tag.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Eye size={15} />
                    Xem
                  </Link>

                  <Link
                    to={`/tags/${tag.id}/edit`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Pencil size={15} />
                    Sửa
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(tag)}
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
              Tổng cộng {pagination.total} tag
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() =>
                  loadTags(pagination.current_page - 1)
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
                  pagination.current_page >=
                  pagination.last_page
                }
                onClick={() =>
                  loadTags(pagination.current_page + 1)
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

export default TagsIndex;