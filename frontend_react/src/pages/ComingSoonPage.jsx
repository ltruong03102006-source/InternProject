import { Construction } from "lucide-react";

function ComingSoonPage({ title }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <Construction size={32} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-800">
          {title}
        </h1>

        <p className="mt-3 text-slate-500">
          Chức năng này đang được phát triển và sẽ được hoàn thiện ở các bước tiếp theo.
        </p>
      </div>
    </div>
  );
}

export default ComingSoonPage;