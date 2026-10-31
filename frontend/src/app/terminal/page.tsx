import { redirect } from 'next/navigation';

export default function TerminalPage({
  searchParams,
}: {
  searchParams?: { symbol?: string };
}) {
  const sym = searchParams?.symbol ? `?symbol=${encodeURIComponent(searchParams.symbol)}` : '';
  redirect(`/app/paper-trading${sym}`);
}
