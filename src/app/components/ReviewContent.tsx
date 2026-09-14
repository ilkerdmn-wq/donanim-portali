import {SPEC_FIELDS,imageUrl,type ReviewBlock} from "@/app/lib/reviews";
export function ReviewSpecs({specs}:{specs:Record<string,string>}){const fields=SPEC_FIELDS.filter(([k])=>specs[k]);if(!fields.length)return null;return <section className="my-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5"><h2 className="text-lg font-black mb-4">Hızlı Teknik Özellikler</h2><dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">{fields.map(([k,label])=><div key={k} className="min-w-0"><dt className="text-xs text-cyan-400">{label}</dt><dd className="mt-2 text-sm text-zinc-200 break-words">{specs[k]}</dd></div>)}</dl></section>}
export function ReviewBody({blocks}:{blocks:ReviewBlock[]}){return <div className="space-y-6 text-zinc-300 leading-8 break-words">{blocks.map((b,i)=>{
 if(b.type==="h2")return <h2 key={i} id={`bolum-${i}`} className="scroll-mt-24 text-2xl font-black text-white pt-4">{b.value}</h2>;
 if(b.type==="h3")return <h3 key={i} id={`bolum-${i}`} className="scroll-mt-24 text-xl font-bold text-white">{b.value}</h3>;
 if(b.type==="image")return imageUrl(b.value)?<img key={i} src={imageUrl(b.value)} alt="İnceleme görseli" loading="lazy" className="w-full rounded-2xl"/>:null;
 if(b.type==="quote")return <blockquote key={i} className="border-l-2 border-cyan-400 pl-5 whitespace-pre-wrap">{b.value}</blockquote>;
 if(b.type==="list")return <ul key={i} className="list-disc pl-6">{b.value.split("\n").filter(v=>v.trim()).map((v,j)=><li key={j}>{v}</li>)}</ul>;
 if(b.type==="table"){const rows=b.value.split("\n").filter(v=>v.trim()).map(v=>v.split("|").map(c=>c.trim()));return <div key={i} className="overflow-x-auto rounded-xl border border-zinc-800"><table className="w-full text-sm text-left"><thead><tr>{rows[0]?.map((c,j)=><th key={j} className="p-3 bg-zinc-900 text-cyan-400">{c}</th>)}</tr></thead><tbody>{rows.slice(1).map((row,j)=><tr key={j}>{row.map((c,k)=><td key={k} className="p-3 border-t border-zinc-800">{c}</td>)}</tr>)}</tbody></table></div>;}
 return <p key={i} className="whitespace-pre-wrap">{b.value}</p>;
 })}</div>}
