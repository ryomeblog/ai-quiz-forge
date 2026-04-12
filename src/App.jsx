import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import BottomNav from "./components/common/BottomNav.jsx";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { ExamProvider } from "./contexts/ExamContext.jsx";
import { HistoryProvider } from "./contexts/HistoryContext.jsx";
import { PlayProvider } from "./contexts/PlayContext.jsx";
import { AIPreviewProvider } from "./contexts/AIPreviewContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import ExamCreatePage from "./pages/ExamCreatePage.jsx";
import ExamEditPage from "./pages/ExamEditPage.jsx";
import QuestionManagePage from "./pages/QuestionManagePage.jsx";
import QuestionEditPage from "./pages/QuestionEditPage.jsx";
import PlayPage from "./pages/PlayPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <SettingsProvider>
        <ExamProvider>
          <HistoryProvider>
            <AIPreviewProvider>
              <PlayProvider>
                <div className="flex min-h-screen flex-col bg-brand-neutral-bg text-brand-ink">
                  <main className="flex-1 pb-[88px]">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/exams/new" element={<ExamCreatePage />} />
                      <Route path="/exams/:id/edit" element={<ExamEditPage />} />
                      <Route path="/exams/:id/questions" element={<QuestionManagePage />} />
                      <Route path="/exams/:id/questions/edit" element={<QuestionEditPage />} />
                      <Route path="/exams/:id/questions/:qid/edit" element={<QuestionEditPage />} />
                      <Route path="/play/:id" element={<PlayPage />} />
                      <Route path="/play/:id/result" element={<ResultPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <BottomNav />
                  <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
                </div>
              </PlayProvider>
            </AIPreviewProvider>
          </HistoryProvider>
        </ExamProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
