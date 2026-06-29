'use client';
import { useRouter } from 'next/navigation';
import { fetchWithRefresh } from '../lib/fetchWithRefresh';


export default function Header() {
  const router = useRouter();
return (
<header className="relative z-0 w-full flex py-1 sm:py-2 justify-between items-center box-border px-3">
    <div className="absolute inset-0 -z-10" />

    <div className="ml-auto">
      <button
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          localStorage.removeItem('nickname');
          localStorage.removeItem('profilePicture');
          router.replace('/login');
          router.refresh();
        }}
        className=" btn_orange text-sm sm:text-base"
      >
        Logout
      </button>
    </div>

  </header>
);
}