import { WhiteboardLoader } from "../components/WhiteboardLoader";
import { loadBuiltinIcons } from "../lib/builtinIcons";

// Icons are read from disk per request, so a file dropped into public/icons
// shows up on refresh instead of needing a rebuild.
export const dynamic = "force-dynamic";

export default function Home() {
  return <WhiteboardLoader builtinIcons={loadBuiltinIcons()} />;
}
