import { useEffect } from "react";
import { Terminal, X } from "lucide-react";
import Screen from "@components/Screen";
import "./terminal/chat/chat.css";
import "./TerminalModal.css";

type TerminalModalProps = {
  contactEmail: string;
  onAskAi: () => void;
  onBookCall: () => void;
  onClose: () => void;
};

export default function TerminalModal({
  contactEmail,
  onAskAi,
  onBookCall,
  onClose,
}: TerminalModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="chat-wrap terminal-modalWrap is-maximized"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
    >
      <div className="chat-window terminal-modalWindow is-maximized">
        <div className="chat-header terminal-modalHeader">
          <div className="chat-title">
            <Terminal size={18} />
            <span>Terminal</span>
          </div>
          <div className="chat-actions">
            <button
              className="ghost t-pressable"
              title="Close"
              aria-label="Close terminal"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="terminal-modalBody">
          <Screen
            contact={{ email: contactEmail }}
            onAskAi={onAskAi}
            onBookCall={onBookCall}
            presentation="embedded"
            showChatDock={false}
          />
        </div>
      </div>
    </div>
  );
}
