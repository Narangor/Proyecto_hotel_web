'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X, Send } from 'lucide-react';
import type { ChatMessage } from '../hooks/useChat';

const GOLD       = '#C6A75E';
const DARK_BROWN = '#2B1B18';
const DEEP_BROWN = '#4A2E2A';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ChatSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-2" aria-hidden="true">
      {/* Avatar placeholder */}
      <div
        className="shrink-0 rounded-full animate-pulse"
        style={{ width: 32, height: 32, backgroundColor: 'rgba(198,167,94,0.25)' }}
      />
      {/* Líneas de texto */}
      <div className="flex flex-col gap-2 flex-1 pt-1">
        <div
          className="h-3 rounded-full animate-pulse"
          style={{ width: '75%', backgroundColor: 'rgba(74,46,42,0.12)' }}
        />
        <div
          className="h-3 rounded-full animate-pulse"
          style={{ width: '55%', backgroundColor: 'rgba(74,46,42,0.08)' }}
        />
      </div>
    </div>
  );
}

// ── Burbuja de mensaje ─────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-2 px-4 py-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="shrink-0 rounded-full flex items-center justify-center mb-1"
          style={{ width: 28, height: 28, backgroundColor: GOLD }}
        >
          <Image src="/images/chat/face-agent.png" alt="" width={20} height={20} />
        </div>
      )}

      {/* Texto */}
      <div
        className="max-w-[75%] text-[13px] leading-[1.5] rounded-2xl px-3 py-2"
        style={
          isUser
            ? { backgroundColor: GOLD, color: '#ffffff', fontFamily: 'var(--font-sans)' }
            : { backgroundColor: '#F4EFEA', color: DEEP_BROWN, fontFamily: 'var(--font-sans)' }
        }
      >
        {message.text}
      </div>
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────

interface ChatModalProps {
  abierto: boolean;
  onCerrar: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onEnviar: () => void;
}

export default function ChatModal({
  abierto,
  onCerrar,
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onEnviar,
}: ChatModalProps) {
  const t = useTranslations('chat');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll al último mensaje cuando cambia la lista o el loading
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus en el input al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && abierto) onCerrar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      {/* Backdrop semitransparente */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(43,27,24,0.3)' }}
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Panel del chat */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('ariaLabel')}
        className="fixed bottom-[88px] right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: 'min(360px, calc(100vw - 24px))',
          height: 'min(500px, calc(100svh - 120px))',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(198,167,94,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ backgroundColor: DARK_BROWN }}
        >
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{ width: 36, height: 36, backgroundColor: GOLD }}
          >
            <Image src="/images/chat/face-agent.png" alt="" width={26} height={26} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span
              className="text-white text-[14px] font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {t('titulo')}
            </span>
            <span
              className="text-[11px] leading-tight"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-sans)' }}
            >
              Hotel Santa María
            </span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full p-1 transition-opacity hover:opacity-70 shrink-0"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            aria-label={t('cerrar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Lista de mensajes */}
        <div
          className="flex-1 overflow-y-auto py-3 flex flex-col gap-1"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {/* Skeleton de carga */}
          {isLoading && <ChatSkeleton />}

          {/* Ancla de scroll */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-3"
          style={{ borderTop: '1px solid rgba(74,46,42,0.08)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnviar(); } }}
            placeholder={t('placeholder')}
            disabled={isLoading}
            aria-label={t('placeholder')}
            className="flex-1 text-[13px] rounded-xl px-3 py-2 focus:outline-none disabled:opacity-50 min-w-0"
            style={{
              backgroundColor: '#F4EFEA',
              border: '1px solid rgba(74,46,42,0.12)',
              color: DEEP_BROWN,
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            type="button"
            onClick={onEnviar}
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0 flex items-center justify-center rounded-xl transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: GOLD, width: 36, height: 36 }}
            aria-label={t('enviar')}
          >
            <Send size={16} color="#ffffff" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
