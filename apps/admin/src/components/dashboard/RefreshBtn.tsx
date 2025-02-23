"use client";

import { useRouter } from "next/navigation";
import { FaSyncAlt } from "react-icons/fa";

export default function RefreshBtn() {
  const router = useRouter();
  return (
    <button
      className="text-gray-400 bg-gray-700 p-2 rounded-full"
      onClick={async (e) => {
        e.currentTarget?.classList.add("rotate");
        // await revalidateDashboard();
        router.refresh();
        e.currentTarget?.classList.remove("rotate");
      }}
    >
      {" "}
      <FaSyncAlt className="w-7 h-7" title="Refresh" />{" "}
    </button>
  );
}
