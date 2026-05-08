import Image from 'next/image';
import Link from 'next/link';

export default function InvolvementCard({ item }) {
  const content = (
    <>
      <div className="relative aspect-[1.42/1] overflow-hidden rounded-[10px]">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 25vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 text-center">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-orange-700 dark:text-white">
          {item.eyebrow}
        </p>
        <h3 className="mt-2 text-[1.02rem] font-black tracking-tight text-stone-950 dark:text-white">
          {item.title}
        </h3>
        <p className="mt-3 text-[13px] leading-6 text-stone-600 dark:text-slate-300">
          {item.description}
        </p>
        <div className="mt-4">
          {item.href ? (
            <span className="inline-flex items-center rounded-[10px] border border-stone-300 bg-stone-50 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-stone-900 transition group-hover:border-stone-500 group-hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:group-hover:border-slate-500 dark:group-hover:bg-slate-700">
              {item.cta}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-[10px] border border-orange-200 bg-orange-50 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-orange-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              {item.note}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-3 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.26)] dark:border-slate-800 dark:bg-slate-900"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-3 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-900">
      {content}
    </article>
  );
}
