// غلاف الصفحات العامة (تواصل، أسئلة شائعة، خصوصية...) — متاحة للجميع

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
export default function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-grow pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}