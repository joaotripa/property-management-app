import { Loading } from "@/components/ui/loading";

export default function PropertyDetailsLoading() {
  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      <Loading />
    </div>
  );
}
