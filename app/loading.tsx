import { LoaderMark } from "@/components/layout/PageLoader";

// Shown at once on any navigation while the next screen renders on the server.
export default function Loading() {
  return (
    <div className="sk-loading-page">
      <LoaderMark />
    </div>
  );
}
