import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import SubjectCreate from "./pages/Subjects/Create";
import SubjectDetail from "./pages/Subjects/Detail";
import SubjectEdit from "./pages/Subjects/Edit";
import SubjectsIndex from "./pages/Subjects/Index";

import TagCreate from "./pages/Tags/Create";
import TagDetail from "./pages/Tags/Detail";
import TagEdit from "./pages/Tags/Edit";
import TagsIndex from "./pages/Tags/Index";

import NoteCreate from "./pages/Notes/Create";
import NoteDetail from "./pages/Notes/Detail";
import NoteEdit from "./pages/Notes/Edit";
import NotesIndex from "./pages/Notes/Index";

function App() {
  const token = localStorage.getItem("access_token");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={token ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <RegisterPage />
        }
      />

      <Route
        element={
          token
            ? <AppLayout />
            : <Navigate to="/login" replace />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/subjects" element={<SubjectsIndex />} />
        <Route path="/subjects/create" element={<SubjectCreate />} />
        <Route path="/subjects/:id" element={<SubjectDetail />} />
        <Route path="/subjects/:id/edit" element={<SubjectEdit />} />

        <Route path="/tags" element={<TagsIndex />} />
        <Route path="/tags/create" element={<TagCreate />} />
        <Route path="/tags/:id" element={<TagDetail />} />
        <Route path="/tags/:id/edit" element={<TagEdit />} />

        <Route path="/notes" element={<NotesIndex />} />
        <Route path="/notes/create" element={<NoteCreate />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/notes/:id/edit" element={<NoteEdit />} />

        <Route
          path="/deadlines"
          element={<ComingSoonPage title="Quản lý deadline" />}
        />

        <Route
          path="/documents"
          element={<ComingSoonPage title="Tài liệu học tập" />}
        />

        <Route
          path="/profile"
          element={<ComingSoonPage title="Tài khoản cá nhân" />}
        />

        <Route
          path="/admin/users"
          element={<ComingSoonPage title="Quản lý người dùng" />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={token ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;