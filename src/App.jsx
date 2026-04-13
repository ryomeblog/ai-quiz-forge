import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
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
import TutorialPage from "./pages/TutorialPage.jsx";
import { KEYS, readString } from "./utils/storage.js";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <SettingsProvider>
        <ExamProvider>
          <HistoryProvider>
            <AIPreviewProvider>
              <PlayProvider>
                <AppShell />
              </PlayProvider>
            </AIPreviewProvider>
          </HistoryProvider>
        </ExamProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const [firstRouteChecked, setFirstRouteChecked] = useState(false);
  const [needsTutorial, setNeedsTutorial] = useState(false);

  // 初回起動チェック：未読かつ /tutorial 以外なら強制表示
  useEffect(() => {
    if (firstRouteChecked) return;
    setFirstRouteChecked(true);
    const seen = readString(KEYS.tutorialSeen, "");
    if (seen !== "1" && location.pathname !== "/tutorial") {
      setNeedsTutorial(true);
    }
  }, [firstRouteChecked, location.pathname]);

  const isTutorialRoute = location.pathname === "/tutorial";
  const hideBottomNav = isTutorialRoute || needsTutorial;

  if (needsTutorial) {
    return (
      <div className="flex min-h-screen flex-col bg-brand-neutral-bg text-brand-ink">
        <TutorialPage onComplete={() => setNeedsTutorial(false)} />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-neutral-bg text-brand-ink">
      <main className={hideBottomNav ? "flex-1" : "flex-1 pb-[88px]"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
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
      {!hideBottomNav && <BottomNav />}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
