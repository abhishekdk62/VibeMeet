// hooks/useToasts.js
import { toast } from 'react-hot-toast';
import {
  SuccessToast,
  ErrorToast,
  InfoToast,
  WarningToast,
  ConnectionToast,
  MicToast,
  VideoToast
} from '../components/toast/ToastComponents';

export const useToasts = () => {
  const showSuccess = ({ title, message, action, duration = 4000 }) => {
    return toast.custom(
      (t) => (
        <SuccessToast
          t={t}
          title={title}
          message={message}
          action={action}
        />
      ),
      { duration, id: `success-${Date.now()}` }
    );
  };

  const showError = ({ title, message, action, duration = 5000 }) => {
    return toast.custom(
      (t) => (
        <ErrorToast
          t={t}
          title={title}
          message={message}
          action={action}
        />
      ),
      { duration, id: `error-${Date.now()}` }
    );
  };

  const showInfo = ({ title, message, action, duration = 4000 }) => {
    return toast.custom(
      (t) => (
        <InfoToast
          t={t}
          title={title}
          message={message}
          action={action}
        />
      ),
      { duration, id: `info-${Date.now()}` }
    );
  };

  const showWarning = ({ title, message, action, duration = 4000 }) => {
    return toast.custom(
      (t) => (
        <WarningToast
          t={t}
          title={title}
          message={message}
          action={action}
        />
      ),
      { duration, id: `warning-${Date.now()}` }
    );
  };

  // Meeting-specific toasts
  const showConnection = ({ isConnected, action, duration = 3000 }) => {
    return toast.custom(
      (t) => (
        <ConnectionToast
          t={t}
          isConnected={isConnected}
          action={action}
        />
      ),
      { duration, id: 'connection-status' }
    );
  };

  const showMicStatus = ({ isMuted, action, duration = 2000 }) => {
    return toast.custom(
      (t) => (
        <MicToast
          t={t}
          isMuted={isMuted}
          action={action}
        />
      ),
      { duration, id: 'mic-status' }
    );
  };

  const showVideoStatus = ({ isEnabled, action, duration = 2000 }) => {
    return toast.custom(
      (t) => (
        <VideoToast
          t={t}
          isEnabled={isEnabled}
          action={action}
        />
      ),
      { duration, id: 'video-status' }
    );
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConnection,
    showMicStatus,
    showVideoStatus,
    dismiss: toast.dismiss,
    dismissAll: () => toast.dismiss()
  };
};

 export const toastManager = useToasts();
