import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Subjects
import SubjectCreate from "./pages/Subjects/Create";
import SubjectDetail from "./pages/Subjects/Detail";
import SubjectEdit from "./pages/Subjects/Edit";
import SubjectsIndex from "./pages/Subjects/Index";

// Tags
import TagCreate from "./pages/Tags/Create";
import TagDetail from "./pages/Tags/Detail";
import TagEdit from "./pages/Tags/Edit";
import TagsIndex from "./pages/Tags/Index";

// Notes
import NoteCreate from "./pages/Notes/Create";
import NoteDetail from "./pages/Notes/Detail";
import NoteEdit from "./pages/Notes/Edit";
import NotesIndex from "./pages/Notes/Index";

// Deadlines
import DeadlineCreate from "./pages/Deadlines/Create";
import DeadlineDetail from "./pages/Deadlines/Detail";
import DeadlineEdit from "./pages/Deadlines/Edit";
import DeadlinesIndex from "./pages/Deadlines/Index";

// Documents
import DocumentCreate from "./pages/Documents/Create";
import DocumentDetail from "./pages/Documents/Detail";
import DocumentsIndex from "./pages/Documents/Index";

// Profile
import ProfileIndex from "./pages/Profile/Index";
import ProfilePassword from "./pages/Profile/Password";

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
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/register"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route
        element={
          token ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* Subjects */}
        <Route
          path="/subjects"
          element={<SubjectsIndex />}
        />
        <Route
          path="/subjects/create"
          element={<SubjectCreate />}
        />
        <Route
          path="/subjects/:id"
          element={<SubjectDetail />}
        />
        <Route
          path="/subjects/:id/edit"
          element={<SubjectEdit />}
        />

        {/* Tags */}
        <Route
          path="/tags"
          element={<TagsIndex />}
        />
        <Route
          path="/tags/create"
          element={<TagCreate />}
        />
        <Route
          path="/tags/:id"
          element={<TagDetail />}
        />
        <Route
          path="/tags/:id/edit"
          element={<TagEdit />}
        />

        {/* Notes */}
        <Route
          path="/notes"
          element={<NotesIndex />}
        />
        <Route
          path="/notes/create"
          element={<NoteCreate />}
        />
        <Route
          path="/notes/:id"
          element={<NoteDetail />}
        />
        <Route
          path="/notes/:id/edit"
          element={<NoteEdit />}
        />

        {/* Deadlines */}
        <Route
          path="/deadlines"
          element={<DeadlinesIndex />}
        />
        <Route
          path="/deadlines/create"
          element={<DeadlineCreate />}
        />
        <Route
          path="/deadlines/:id"
          element={<DeadlineDetail />}
        />
        <Route
          path="/deadlines/:id/edit"
          element={<DeadlineEdit />}
        />

        {/* Documents */}
        <Route
          path="/documents"
          element={<DocumentsIndex />}
        />
        <Route
          path="/documents/create"
          element={<DocumentCreate />}
        />
        <Route
          path="/documents/:id"
          element={<DocumentDetail />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<ProfileIndex />}
        />
        <Route
          path="/profile/password"
          element={<ProfilePassword />}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ComingSoonPage title="Quản trị hệ thống" />
          }
        />

        <Route
          path="/admin/users"
          element={
            <ComingSoonPage title="Quản lý người dùng" />
          }
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