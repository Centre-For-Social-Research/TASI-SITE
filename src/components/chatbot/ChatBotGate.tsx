'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Split into its own chunk so the admin console, which never shows the
// chatbot, does not download it.
const ChatBot = dynamic(() => import('./ChatBot'));

export default function ChatBotGate() {
  const pathname = usePathname();

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return null;
  }

  return <ChatBot />;
}
