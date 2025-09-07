
export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}