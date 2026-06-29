"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithRefresh } from "../lib/fetchWithRefresh";
import { usePathname } from 'next/navigation';
import InputBox from '@/components/InputBox'


export const dynamic = "force-dynamic";

const API = "/api";


export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newNickname, setNewNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const avatarInputRef = useRef(null);

  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [qrCode, setQrCode] = useState('');           // QR code en base64
  const [setupToken, setSetupToken] = useState('');    // code entré pour confirmer
  const [twoFaMessage, setTwoFaMessage] = useState(''); // message de succès/erreur
  const [showSetup, setShowSetup] = useState(false);   // afficher le formulaire
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);


  async function loadUsers(meId) {
    try {
      const res = await fetchWithRefresh(`${API}/users`);
      const data = await res.json();
      setUsers(data);
      // We are forcing the correct user, not data[0]
      if (meId) setSelectedId(String(meId));
    } catch (err) {
      setMessage(`Network error : ${err.message}`);
    }
  }

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setUsers([]);
    setFriends([]);
    setSelectedId(null);
    setMessage("");

    (async () => {
      try {
        const res = await fetchWithRefresh('/api/users/me');
        if (cancelled) return;
        if (!res.ok) { router.push('/login'); return; }
        const me = await res.json();
        if (cancelled) return;
        setIs2FAEnabled(me.FAkey !== null);
        await loadUsers(me.id); // ← passe l'id directement
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setIsLoading(false);
          router.push('/login');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pathname]);


  const selectedUser = users.find((u) => String(u.id) === selectedId);
  // const avatarName = selectedUser?.avatar ?? "default_avatar.png";
  const otherUsers = users.filter((u) => String(u.id) !== selectedId);
  const previewUsers = showAllUsers ? otherUsers : otherUsers.slice(0, 5);
  const hasMoreUsers = otherUsers.length > 5;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedId) {
      setFriends([]);
      return;
    }
    (async () => {
      try {
        const res = await fetchWithRefresh(`${API}/users/${selectedId}/friends`);
        if (res.ok) setFriends(await res.json());
      } catch {
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetchWithRefresh(
          `${API}/users/search?q=${encodeURIComponent(searchQuery.trim())}&me=${selectedId}`,
        );
        if (res.ok) setSearchResults(await res.json());
      } catch {
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, selectedId]);

  async function handleUpdate(e) {
    e.preventDefault();
    setMessage("");
    setUpdateError("");
    setUpdateSuccess("");

    if (!selectedId) {
      setMessage("Choose a user from the list.");
      return;
    }
    const body = {};
    if (newNickname.trim()) body.nickname = newNickname.trim();
    if (newPassword) body.password = newPassword;
    if (Object.keys(body).length === 0) {
      setUpdateError("Nothing to update (fill in the nickname and/or password).");
      return;
    }
    try {
      const res = await fetchWithRefresh(`${API}/users/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Le backend renvoie souvent { message: "..." } sur un 400
        setUpdateError(body.message ?? `Erreur ${res.status}`);
        return;
      }
      const updated = await res.json();
      setUpdateSuccess("Profile updated successfully.");
      setNewNickname("");
      setNewPassword("");
      await loadUsers(updated.id);
    } catch (err) {
      setUpdateError(`Network error : ${err.message}`);
    }
  }




  async function handleAvatarUpload(file) {
    setMessage("");
    if (!selectedId) {
      setMessage("Choose a user from the list.");
      return;
    }
    if (!file) {
      setMessage("Choose an image to upload.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetchWithRefresh(`${API}/users/${selectedId}/avatar`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        setMessage(`Erreur ${res.status} : ${await res.text()}`);
        return;
      }
      const updated = await res.json();
      setMessage(`Avatar de l'utilisateur ${updated.id} mis a jour.`);
      await loadUsers();
    } catch (err) {
      setMessage(`Network error : ${err.message}`);
    }
  }

  async function handleAddFriend(friendId) {
    setMessage("");
    try {
      const res = await fetchWithRefresh(`${API}/users/${selectedId}/friends/${friendId}`, {
        method: "POST",
      });
      if (!res.ok) {
        setMessage(`Network error ${res.status} : ${await res.text()}`);
        return;
      }
      const updatedFriends = await res.json();
      setFriends(updatedFriends);
      // Le user ajouté disparait des results
      setSearchResults((r) => r.filter((u) => u.id !== friendId));
      setMessage(`Ami ajouté.`);
    } catch (err) {
      setMessage(`Network error : ${err.message}`);
    }
  }

  async function handleRemoveFriend(friendId) {
    setMessage("");
    try {
      const res = await fetchWithRefresh(`${API}/users/${selectedId}/friends/${friendId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessage(`Network error ${res.status} : ${await res.text()}`);
        return;
      }
      const updatedFriends = await res.json();
      setFriends(updatedFriends);
      setMessage(`Friend removed.`);
    } catch (err) {
      setMessage(`Network error : ${err.message}`);
    }
  }
  async function handleSetup2FA() {
    try {
      const res = await fetchWithRefresh('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setTwoFaMessage('Network error during setup. Are you logged in?');
        return;
      }
      const qrData = await res.text();
      setQrCode(qrData);
      setShowSetup(true);
      setIs2FAEnabled(true);
      setTwoFaMessage('');
    } catch {
      setTwoFaMessage('Network error.');
    }
  }

  if (!mounted) return null;


  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-main">

          {/* Title */}
          <h1 className="press-start-title text-orange uppercase break-words"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", lineHeight: 1.25 }}>
            Profile
          </h1>

          {/* Link Home */}
          <div className="-mt-px mb-sm">
            <Link href="/jeu" className="inline-flex items-center justify-center px-md py-sm rounded-lg bg-orange text-beige font-bold no-underline">
              Home
            </Link>
          </div>

          <div className="flex flex-col items-start gap-lg">

            {/* Card profile */}
            <div className="card w-full">
              <h2 className="card-title">My Profile</h2>

              {selectedUser ? (
                <div className="flex gap-md items-start mb-lg">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink shrink-0 bg-beige">
                    <img
                      src={selectedUser?.avatar ? `${API}/uploads/avatars/${selectedUser.avatar}` : "/default_avatar.png"} alt="avatar"
                      className="w-full h-full object-cover block"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 text-xl font-bold text-orange">
                      {selectedUser.nickname ?? selectedUser.email}
                    </p>
                    <p className="mt-1 text-dark">#{selectedUser.id}</p>
                  </div>
                </div>
              ) : (
                <p className="text-dark mt-0">Choose a user from the right column.</p>
              )}

              <div className="grid gap-sm">
                <button type="button" onClick={() => avatarInputRef.current?.click()}
                  className="text-orange font-bold cursor-pointer underline text-left">
                  Update profile picture
                </button>
                <input
                  ref={avatarInputRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) await handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <form onSubmit={handleUpdate} id="update-profile-form" name="update-profile-form" className="grid gap-sm mb-lg">
                <label htmlFor="new-nickname" className="font-bold text-orange text-lg block">
                  New nickname

                  <InputBox
                    id="new-nickname"
                    name="new-nickname"
                    autoComplete="off"
                    placeholder="new nickname (2-15 chars)"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                  />
                </label>
                <label htmlFor="new-password" className="font-bold text-orange text-lg block">
                  New password
                  <InputBox
                    id="new-password"
                    name="new-password"
                    type="password"
                    placeholder="new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>

                <button className="btn_orange w-auto">Update profile</button>
                {updateError && (
                  <div className="flex items-center gap-xs px-sm py-xs rounded-lg mt-xs"
                    style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 600, fontSize: "0.9rem" }}>
                    {updateError}
                  </div>
                )}
              </form>
            </div>

            {/* Friends */}
            <section id="profile-friends" name="profile-friends" className="profile-friends card w-full">
              <h2 className="card-title">Friends</h2>

              <label className="font-bold text-orange block mb-sm" htmlFor="search">
                Search for a user to add
                <InputBox
                  id="search"
                  name="search"
                  autoComplete="off"
                  type="text"
                  placeholder="type a nickname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={typeof selectedId !== "string"}
                />
              </label>

              {searchResults.length > 0 && (
                <div className="mb-md grid gap-sm mt-sm">
                  {searchResults.map((u) => (
                    <div key={u.id} className="user-card bg-[#fff8ee]">
                      <img src={u.avatar ? `${API}/uploads/avatars/${u.avatar}` : "/default_avatar.png"} alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="text-pink font-bold">{u.nickname ?? u.email}</span>{' '}
                        <small className="text-dark">#{u.id}</small>
                      </span>
                      <button onClick={() => handleAddFriend(u.id)}
                        className="px-sm py-xs rounded-lg bg-orange text-beige cursor-pointer border-none">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="profile-info mt-md">My friends ({friends.length})</h3>
              {friends.length === 0 ? (
                <p className="text-dark">You have no friends :(</p>
              ) : (
                <div className="grid gap-sm mt-sm">
                  {friends.map((f) => (
                    <div key={f.id} className="user-card bg-[#fff8ee]">
                      <img src={f.avatar ? `${API}/uploads/avatars/${f.avatar}` : "/default_avatar.png"} alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <span
                        title={f.isOnline ? "En ligne" : "Hors ligne"}
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: f.isOnline ? "#22c55e" : "#9ca3af",
                          boxShadow: f.isOnline ? "0 0 6px #22c55e" : "none",
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="text-pink font-bold">{f.nickname ?? f.email}</span>{' '}
                        <small className="text-dark">#{f.id}</small>
                      </span>
                      <button onClick={() => router.push(`/chat?friend=${f.id}`)} className="profile-button secondary">💬</button>
                      <button onClick={() => router.push(`/profile/${f.id}`)} className="profile-button secondary">View profile</button>
                      <button onClick={() => handleRemoveFriend(f.id)} className="profile-button secondary">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2FA */}
            <section className="w-full" id="profile-2fa" name="profile-2fa">
              {is2FAEnabled ? (
                <div className="mt-sm p-sm">
                  <p className="text-orange font-bold m-0">2FA activé ✅</p>
                  <button className="profile-button secondary mt-sm" onClick={async () => {
                    if (!showSetup && !qrCode) {
                      const res = await fetchWithRefresh('/api/auth/2fa/setup', { method: 'POST' });
                      if (res.ok) setQrCode(await res.text());
                    }
                    setShowSetup(prev => !prev);
                  }}>
                    {showSetup ? "Masquer le QR Code" : "Voir le QR Code"}
                  </button>
                  {showSetup && qrCode && (
                    <div className="mt-sm">
                      <img src={qrCode} alt="QR Code 2FA" width={200} />
                      <p className="mt-sm text-dark text-sm">Scan this QR code with Google Authenticator.</p>
                    </div>
                  )}
                </div>
              ) : (
                <button className="profile-button primary" onClick={handleSetup2FA}>
                  Enable 2FA (Google Authenticator)
                </button>
              )}
              {twoFaMessage && <p className="text-orange mt-sm">{twoFaMessage}</p>}
            </section>

            {/* Other users */}
            <section id="profile-other-users" name="profile-other-users" className="w-full">
              <h2 className="card-title">Other users</h2>
              {otherUsers.length === 0 ? (
                <p className="text-dark m-0">You are all alone :(</p>
              ) : (
                <>
                  <div className="grid gap-sm mb-sm">
                    {previewUsers.map((user) => (
                      <div className="user-card" key={user.id}>
                        <img
                          src={user.avatar ? `${API}/uploads/avatars/${user.avatar}` : "/default_avatar.png"} alt={user.nickname ?? user.email}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                          style={{ border: "2px solid rgba(240, 86, 58, 0.18)" }}
                        />
                        <span className="flex-1 min-w-0 font-bold">
                          {user.nickname ?? user.email}
                        </span>
                      </div>
                    ))}
                  </div>
                  {hasMoreUsers && !showAllUsers && (
                    <button type="button" onClick={() => setShowAllUsers(true)} className="profile-button secondary">
                      View all
                    </button>
                  )}
                  {hasMoreUsers && showAllUsers && (
                    <button type="button" onClick={() => setShowAllUsers(false)} className="profile-button secondary">
                      Reduce
                    </button>
                  )}
                </>
              )}
            </section>

          </div>

          {message && <p className="profile-message">{message}</p>}

        </section>
      </div>
    </main>
  );
}
