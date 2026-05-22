import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { marked } from "marked";
import {
  Bot,
  CalendarDays,
  ExternalLink,
  Mail,
  Maximize2,
  Minus,
  RotateCcw,
  SendIcon,
  StopCircle,
  X,
} from "lucide-react";
import { useChatStore } from "@stores/chatStore";
import { getChatActions, getChatDisplayContent } from "./chatActions";
import "./chat.css";

type ChatDockProps = {
  onBookCall?: () => void;
  contactEmail?: string;
};

export function ChatDock({
  onBookCall,
  contactEmail = "contact@failuresmith.xyz",
}: ChatDockProps) {
  // Select all needed slices in one selector and shallow-compare to cut down on re-renders.
  const {
    messages,
    input,
    loading,
    isOpen,
    isMinimized,
    unread,
    tone,
    maximizeOnOpen,
    setInput,
    setTone,
    sendMessage,
    clear,
    toggleChat,
    minimizeChat,
    cancel,
    markRead,
    setMaximizeOnOpen,
  } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
      input: state.input,
      loading: state.loading,
      isOpen: state.isOpen,
      isMinimized: state.isMinimized,
      unread: state.unread,
      tone: state.tone,
      maximizeOnOpen: state.maximizeOnOpen,
      setInput: state.setInput,
      setTone: state.setTone,
      sendMessage: state.sendMessage,
      clear: state.clear,
      toggleChat: state.toggleChat,
      minimizeChat: state.minimizeChat,
      cancel: state.cancel,
      markRead: state.markRead,
      setMaximizeOnOpen: state.setMaximizeOnOpen,
    })),
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const activePointerRef = useRef<number | null>(null);

  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    if (unread > 0) markRead();
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, markRead, unread]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isMinimized) {
        e.preventDefault();
        minimizeChat();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isMinimized, toggleChat, minimizeChat]);

  useEffect(() => {
    if (!isOpen) setIsMaximized(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && maximizeOnOpen) {
      setIsMaximized(true);
      setMaximizeOnOpen(false);
    }
  }, [isOpen, maximizeOnOpen, setMaximizeOnOpen]);

  useEffect(() => {
    if (!isMaximized) return;
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
    activePointerRef.current = null;
  }, [isMaximized]);

  const hasStreamingChunk = useMemo(
    () => messages.some((m) => m.id === "streaming"),
    [messages],
  );

  const showTypingIndicator = loading && !hasStreamingChunk;

  const tonePresets = useMemo(
    () => [
      {
        key: "technical" as const,
        label: "Engineer",
        helper: "Concise, Technical",
      },
      {
        key: "non-technical" as const,
        label: "Non-Engineer",
        helper: "Business language",
      },
    ],
    [],
  );

  const handleTonePreset = useCallback(
    (presetKey: "technical" | "non-technical") => {
      const preset = tonePresets.find((p) => p.key === presetKey);
      if (!preset) return;
      setTone(preset.key);
    },
    [setTone, tonePresets],
  );

  const resetDragState = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    activePointerRef.current = null;
  };

  const endDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event?.currentTarget && activePointerRef.current !== null) {
      event.currentTarget.releasePointerCapture(activePointerRef.current);
    }
    resetDragState();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button")) return;
    event.preventDefault();
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    if (deltaX === 0 && deltaY === 0) return;
    setDragOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    endDrag(event);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    endDrag(event);
  };

  const showToneSelector = !messages.some((message) => message.role === "user");
  console.log("showToneSelector", showToneSelector)

  const renderedMessages = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    let toneInserted = false;

    messages.forEach((message, index) => {
      const roleClass =
        message.role === "user"
          ? "chat-bubble user"
          : message.role === "assistant"
            ? "chat-bubble bot"
            : "chat-bubble intro";

      const actions =
        message.role === "assistant"
          ? getChatActions(message.content || "", contactEmail)
          : [];
      const displayContent =
        message.role === "assistant"
          ? getChatDisplayContent(message.content || "", actions)
          : message.content;

      nodes.push(
        <div key={message.id} className={roleClass}>
          {message.role === "assistant" && (
            <span className="chat-avatar" aria-hidden="true">
              <Bot size={18} />
            </span>
          )}
          {message.role === "assistant" ? (
            <div className="chat-messageBody">
              <div
                className="chat-content"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(displayContent),
                }}
              />
              {actions.length ? (
                <div className="chat-actionList" aria-label="Suggested actions">
                  {actions.map((action) =>
                    action.kind === "booking" && onBookCall ? (
                      <button
                        key={action.id}
                        type="button"
                        className="chat-actionButton"
                        onClick={(event) => {
                          event.stopPropagation();
                          onBookCall();
                        }}
                      >
                        <CalendarDays size={14} />
                        <span>{action.label}</span>
                      </button>
                    ) : (
                      <a
                        key={action.id}
                        className="chat-actionButton"
                        href={action.href}
                        target={action.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={action.href.startsWith("mailto:") ? undefined : "noreferrer"}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {action.kind === "email" ? (
                          <Mail size={14} />
                        ) : (
                          <ExternalLink size={14} />
                        )}
                        <span>{action.label}</span>
                      </a>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="chat-content">{message.content}</div>
          )}
        </div>,
      );
    });

    if (
      !toneInserted &&
      showToneSelector
    ) {
      nodes.push(
        <div
          key="chat-tone-selector"
          className="chat-tone"
          aria-label="Tone selector"
        >
          <span id="chat-tone-label" className="chat-tone-title">
            Select Your Desired Tone
          </span>
          <div
            className="chat-tone-options"
            role="radiogroup"
            aria-labelledby="chat-tone-label"
          >
            {tonePresets.map((preset) => (
              <label
                key={preset.key}
                className={`chat-tone-option${tone === preset.key ? " is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="chat-tone"
                  value={preset.key}
                  checked={tone === preset.key}
                  onChange={() => handleTonePreset(preset.key)}
                />
                <span className="chat-tone-radio" aria-hidden="true" />
                <div className="chat-tone-text">
                  <span className="chat-tone-option-label">{preset.label}</span>
                  <span className="chat-tone-option-helper">{preset.helper}</span>
                </div>
              </label>
            ))}
          </div>
        </div>,
      );
      toneInserted = true;
    }

    return nodes;
  }, [
    messages,
    showToneSelector,
    tone,
    tonePresets,
    handleTonePreset,
    onBookCall,
    contactEmail,
  ]);

  const send = async () => {
    await sendMessage();
    focusInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      minimizeChat();
    }
  };

  const wrapTransformStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      {isOpen && !isMinimized ? (
        <div
          className={`chat-wrap${isMaximized ? " is-maximized" : ""}`}
          role="dialog"
          aria-modal="false"
          onClick={focusInput}
          style={wrapTransformStyle}
        >
          <div className={`chat-window${isMaximized ? " is-maximized" : ""}`}>
            <div
              className={`chat-header${isDragging ? " is-dragging" : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <div className="chat-title">
                <Bot size={18} />
                <span>Welcome!</span>
              </div>
              <div className="chat-actions">
                <button
                  className={`ghost t-pressable${isMaximized ? " is-active" : ""}`}
                  title={isMaximized ? "Restore size" : "Maximize"}
                  aria-label={isMaximized ? "Restore chatbot size" : "Maximize chatbot"}
                  onClick={() => setIsMaximized((prev) => !prev)}
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  className="ghost t-pressable"
                  title="Clear"
                  aria-label="Clear conversation"
                  onClick={clear}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="ghost t-pressable"
                  title="Minimize"
                  aria-label="Minimize chatbot"
                  onClick={minimizeChat}
                >
                  <Minus size={16} />
                </button>
                <button
                  className="ghost t-pressable"
                  title="Close"
                  aria-label="Hide chatbot"
                  onClick={toggleChat}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="chat-body" ref={listRef}>
              {renderedMessages}
              {showTypingIndicator ? (
                <div className="chat-bubble bot">
                  <span className="chat-avatar" aria-hidden="true">
                    <Bot size={18} />
                  </span>
                  <div className="chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-inputRow">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Ask about Milad"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="chat-send t-pressable"
                onClick={loading ? cancel : send}
                aria-label={loading ? "Stop response" : "Send message"}
                disabled={loading ? false : !input.trim()}
              >
                {loading ? <StopCircle size={18} /> : <SendIcon size={18} />}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ChatDock;
