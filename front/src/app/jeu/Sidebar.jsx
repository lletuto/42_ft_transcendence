'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithRefresh } from '../lib/fetchWithRefresh';
import { Suspense } from 'react';

const API = "/api";

/*The side bar and header are transparent padding so we could have the linear gradient
in the background */

function normalizeAvatarFilename(value) {
	if (!value) return 'default_avatar.png';
	return value.startsWith('/uploads/avatars/') ? value.replace('/uploads/avatars/', '') : value;
}

export default function Sidebar() {
	return (
		<Suspense fallback={<div>...</div>}>
			<SidebarContent />
		</Suspense>
	);
}
function SidebarContent() {
	const router = useRouter();
	const [profile, setProfile] = useState({
		username: 'Joueur',
		avatarUrl: '',
	});
	const [isAuthed, setIsAuthed] = useState(null);
	const searchParams = useSearchParams();
	const mode = searchParams.get('mode');
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const response = await fetchWithRefresh('/api/users/me');
				if (!response) return;
				if (!response.ok) {
					setIsAuthed(false);
					throw new Error('Non authentifié');
				}
				const user = await response.json();
				setIsAuthed(true);

				setProfile({
					username: user.username || user.nickname || 'Joueur',
					avatarUrl: normalizeAvatarFilename(user.avatar || user.avatarUrl || user.profilePicture),
				});

				localStorage.setItem('nickname', user.username || user.nickname || 'Joueur');
				localStorage.setItem('profilePicture', normalizeAvatarFilename(user.avatar || user.avatarUrl || user.profilePicture));
			} catch (error) {
				console.error('Erreur:', error);
				setIsAuthed(false);
				setProfile({
					username: localStorage.getItem('nickname') || 'Joueur',
					avatarUrl: normalizeAvatarFilename(localStorage.getItem('profilePicture') || ''),
				});
			}
		};

		loadProfile();
		window.addEventListener('storage', loadProfile);
		return () => window.removeEventListener('storage', loadProfile);
	}, []);

	// useEffect(() => {
	//   if (isAuthed === false) {
	//     router.replace('/login');
	//   }
	// }, [isAuthed, router]);
	const avatarSource = profile.avatarUrl;
	return (
		<aside
			className="relative z-0 flex flex-col items-stretch gap-3 p-2 sm:p-3"
			style={{ width: 'clamp(10px, 15vw, 200px)' }}
		>
			{/* avatar */}
			<div className="relative z-10 flex flex-col items-center gap-1 mb-1">
				<div className="w-full rounded-full overflow-hidden border-4 border-beige shadow-lg bg-beige shrink-0">
					<img
						src={`${API}/uploads/avatars/${profile.avatarUrl || 'default_avatar.png'}`}
						alt="avatar"
						width={120}
						height={120}
						className="w-full h-full object-cover block"
					/>
				</div>
				<div className="text-beige text-lg sm:text-xl font-bold text-center break-words">
					{profile.username}
				</div>
			</div>

			<button onClick={() => { router.push('/profile'); router.refresh(); }} className="btn_pink animate-float-1">
				My profile
			</button>
			<button onClick={() => router.push('/chat')} className="btn_pink animate-float-2">
				Messages
			</button>
			{mode && (
				<button onClick={() => { window.location.href = '/jeu'; }} className="btn_pink animate-float-3">
					Mode
				</button>
			)}
		</aside>
	);
}
