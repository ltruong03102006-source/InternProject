import {
  BookOpen,
  CalendarDays,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Tags,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";

const mainMenuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
];

const studyMenuItems = [
  {
    name: "Môn học",
    path: "/subjects",
    icon: BookOpen,
  },
  {
    name: "Ghi chú",
    path: "/notes",
    icon: FileText,
  },
  {
    name: "Deadline",
    path: "/deadlines",
    icon: CalendarDays,
  },
  {
    name: "Tài liệu học tập",
    path: "/documents",
    icon: FolderOpen,
  },
  {
    name: "Tag / Nhãn",
    path: "/tags",
    icon: Tags,
  },
];

function SidebarLink({ item, onClose }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={20} />
      <span>{item.name}</span>
    </NavLink>
  );
}

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 px-4 py-5 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold">
              N
            </div>

            <div>
              <h1 className="font-bold text-white">NoteStudent</h1>
              <p className="text-xs text-slate-400">
                Quản lý học tập
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto">
          <div>
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng quan
            </p>

            <div className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Học tập
            </p>

            <div className="space-y-1">
              {studyMenuItems.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hệ thống
            </p>

            <div className="space-y-1">
              <SidebarLink
                item={{
                  name: "Tài khoản cá nhân",
                  path: "/profile",
                  icon: UserRound,
                }}
                onClose={onClose}
              />

              {user?.role === "admin" && (
                <SidebarLink
                  item={{
                    name: "Quản lý người dùng",
                    path: "/admin/users",
                    icon: UsersRound,
                  }}
                  onClose={onClose}
                />
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "Người dùng"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || "Chưa có email"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;