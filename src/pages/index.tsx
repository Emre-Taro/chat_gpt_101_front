import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import SignIn from "@/pages/signin";
import { useEffect } from "react";
import { useRouter } from "next/router";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signin"); // /signin にリダイレクト
  }, [router]);

  return null; // 何も表示しない
}
