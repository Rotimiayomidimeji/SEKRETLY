import Landing from "@/components/sk/Landing";
import { getMode } from "@/lib/sk/mode";

export default async function HomePage() {
  return <Landing mode={await getMode()} />;
}
