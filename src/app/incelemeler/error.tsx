"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="max-w-6xl mx-auto p-10"><h1 className="text-2xl font-black">İncelemeler yüklenemedi</h1><button onClick={reset} className="mt-5 rounded-xl bg-cyan-500 text-black px-5 py-3">Tekrar dene</button></main>}
