import { useEffect, useRef, type KeyboardEventHandler, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Dialog({ title, onClose, onKeyDown, children }: { title: string; onClose: () => void; onKeyDown?: KeyboardEventHandler<HTMLDialogElement>; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    if (!node) return;
    if (typeof node.showModal === 'function') node.showModal();
    else node.setAttribute('open', '');
    close.current?.focus({ preventScroll: true });

    return () => {
      if (typeof node.close === 'function' && node.open) node.close();
      else node.removeAttribute('open');
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      className="garden-dialog"
      ref={dialog}
      aria-label={title}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (typeof dialog.current?.showModal === 'function') return;
        if (event.key === 'Escape') onClose();
        if (event.key !== 'Tab') return;
        const items = dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), audio[controls], video[controls]',
        );
        const first = items?.[0];
        const last = items?.[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-inner">
        <button className="icon-button dialog-close" type="button" aria-label="Close dialog" onClick={onClose} ref={close}><X size={21} /></button>
        <h2>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
