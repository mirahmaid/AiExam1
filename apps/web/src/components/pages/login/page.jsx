import LoginForm from "./components/LoginForm";
export default function Page() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
  background:
    "linear-gradient(to bottom, #F7FEFF 0%, #F7FEFF 40%, #E6F9FE 62%, #B1E3F1 82%, #8CCBDF 100%)",
}}
    >
      <div
        className="w-full max-w-3xl rounded-[2.5rem] p-8 sm:p-14 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] border border-white/60 backdrop-blur-sm"
        style={{
          background:
        "linear-gradient(to bottom, #F8FDFE 0%, #F8FDFE 40%, #E8F8FD 62%, #D2F1F8 80%, #AFDDEB 100%)",
        }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002C5A] flex items-center justify-center gap-2">
            <span>اهلا وسهلا بك في منصتنا</span>
            <span>👋</span>
          </h1>
          <p cla ssName="mt-2 text-sm text-slate-500 font-medium">
            سجل الدخول الى حسابك
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
