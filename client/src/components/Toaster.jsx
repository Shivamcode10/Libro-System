import { useToast } from '../utils/toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const Toaster = () => {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) removeToast(toasts[0].id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'border-gray-200 bg-gray-50 text-gray-800';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClass = 'border-green-200 bg-green-50 text-green-800';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'border-red-200 bg-red-50 text-red-800';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-lg border flex items-start gap-3 transform transition-all duration-300 animate-slide-up ${colorClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-1">{toast.title}</h4>
              <p className="text-xs opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
