import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiClock, FiSettings } from "react-icons/fi";
import { usePlay } from "../../contexts/PlayContext.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { useState } from "react";

const TABS = [
  { to: "/", label: "ホーム", icon: FiHome },
  { to: "/history", label: "履歴", icon: FiClock },
  { to: "/settings", label: "設定", icon: FiSettings },
];

export default function BottomNav() {
  const { session, endSession } = usePlay();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingTo, setPendingTo] = useState(null);

  const isPlaying =
    !!session && location.pathname.startsWith("/play/") && !location.pathname.endsWith("/result");

  function handleClick(e, to) {
    if (isPlaying) {
      e.preventDefault();
      setPendingTo(to);
    }
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-nav-bg"
        style={{ height: 72, borderTopColor: "var(--color-nav-divider)" }}
        aria-label="ボトムナビゲーション"
      >
        <ul className="mx-auto flex h-full max-w-md items-stretch justify-around">
          {TABS.map((tab) => {
            const { to, label, icon: Icon } = tab;
            const active =
              to === "/"
                ? location.pathname === "/" ||
                  location.pathname.startsWith("/exams") ||
                  location.pathname.startsWith("/play")
                : location.pathname.startsWith(to);
            return (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  onClick={(e) => handleClick(e, to)}
                  className="flex h-full flex-col items-center justify-center gap-1 text-xs"
                  style={{
                    color: active ? "var(--color-nav-active)" : "var(--color-nav-inactive)",
                  }}
                >
                  <Icon size={22} />
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <ConfirmDialog
        open={!!pendingTo}
        title="プレイを中断しますか？"
        description="進行中の回答はすべて破棄されます。"
        confirmLabel="中断する"
        cancelLabel="続ける"
        onConfirm={() => {
          endSession();
          const to = pendingTo;
          setPendingTo(null);
          if (to) navigate(to);
        }}
        onCancel={() => setPendingTo(null)}
        danger
      />
    </>
  );
}
