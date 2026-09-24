'use client';

import { usePathname } from 'next/navigation';
import ChatBot from './ChatBot';

export default function ChatBotGate() {
  const pathname = usePathname();

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return null;
  }

  return <ChatBot />;
}
