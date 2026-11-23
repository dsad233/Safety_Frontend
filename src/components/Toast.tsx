import { X } from "lucide-react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export default function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="알림 닫기">
        <X size={16} />
      </button>
    </div>
  );
}
