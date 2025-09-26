import { Loading } from "@/components/ui/loading";

export default function AnalyticsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
      <Loading />
    </div>
  );
}