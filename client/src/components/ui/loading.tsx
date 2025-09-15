interface LoadingProps {
  loadingText?: string;
}

export function Loading({ loadingText }: LoadingProps) {
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
      {loadingText}
    </div>
  );
}
