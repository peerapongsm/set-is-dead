"use client";
import { useRouter } from "next/navigation";

export function BackButton() {
  const r = useRouter();
  return (
    <button className="btn" onClick={() => r.push("/")}>
      ← กลับ
    </button>
  );
}
