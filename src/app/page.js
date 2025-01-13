'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  console.log("i amgetting laled")

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      router.push("/search");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div >
    </div>
  );
}
