import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-xl leading-none text-stone-500 hover:text-stone-800"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
