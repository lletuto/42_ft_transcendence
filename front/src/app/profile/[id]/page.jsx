"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithRefresh } from "../../lib/fetchWithRefresh";

const API = "/api";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const me = await fetchWithRefresh(`${API}/users/me`);
        if (!me.ok) {
          router.push("/login");
          return;
        }
        const res = await fetchWithRefresh(`${API}/users/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!data || !data.id) {
          setNotFound(true);
          return;
        }
        setUser(data);
        const fr = await fetchWithRefresh(`${API}/users/${id}/friends`);
        if (fr.ok) setFriends(await fr.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const backBtnClass = "self-start mb-md px-md py-sm rounded-card border-none bg-orange text-beige font-bold text-base cursor-pointer";

  if (loading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center p-lg box-border"
        style={{ background: "linear-gradient(135deg, var(--pink) 0%, var(--orange) 100%)" }}>
        <p className="text-beige font-bold text-lg">Loading...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center p-lg box-border"
        style={{ background: "linear-gradient(135deg, var(--orange) 0%, var(--pink) 100%)" }}>
        <button type="button" onClick={() => router.push("/profile")} className={backBtnClass}>
          My profile
        </button>
        <p className="text-beige font-bold text-lg">User not found</p>
      </main>
    );
  }



  return (
    <main className="min-h-screen w-full flex flex-col items-center p-lg box-border"
      style={{ background: "linear-gradient(135deg, var(--pink) 0%, var(--orange) 100%)" }}>

      <div className="w-full" style={{ maxWidth: "var(--container-md)" }}>
        <button onClick={() => router.push("/profile")} className={backBtnClass}>
          My profile
        </button>

        <div className="card w-full">

          {/* Avatar + infos */}
          <div className="flex flex-col items-center gap-sm">
            <div className="rounded-full overflow-hidden border-4 border-pink bg-beige"
              style={{ width: "clamp(100px, 20vw, 140px)", height: "clamp(100px, 20vw, 140px)" }}>
              <img
                src={user.avatar ? `${API}/uploads/avatars/${user.avatar}` : "/default_avatar.png"}
                 alt="avatar"
                className="w-full h-full object-cover block"
              />
            </div>

            <div className="text-center">
              <p className="m-0 text-2xl font-bold text-orange">
                {user.nickname ?? user.email}
              </p>
              <p className="text-dark text-sm mt-xs">#{user.id}</p>
            </div>

            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-beige font-bold text-sm"
              style={{ color: user.isOnline ? "#15803d" : "var(--dark)" }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: user.isOnline ? "#22c55e" : "#9ca3af",
                  boxShadow: user.isOnline ? "0 0 6px #22c55e" : "none",
                }}
              />
              {user.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Stats */}
          <h3 className="text-orange text-center text-xl font-bold mt-md mb-xs"
            style={{ fontFamily: "var(--font-press-start), cursive" }}>
            Multiplayer statistics
          </h3>

          <div className="grid grid-cols-2 gap-sm mt-sm">
            <div className="bg-pink rounded-card p-md text-center">
              <p className="m-0 text-2xl font-bold" style={{ color: "#15803d" }}>
                {user.winMatch ?? 0}
              </p>
              <p className="font-bold text-dark mt-xs">Victories</p>
            </div>
            <div className="bg-pink rounded-card p-md text-center">
              <p className="m-0 text-2xl font-bold text-orange">
                {user.lostMatch ?? 0}
              </p>
              <p className="font-bold text-dark mt-xs">Defeats</p>
            </div>
          </div>

          {/* Friends */}
          <div className="mt-lg">
            <h3 className="text-orange text-lg font-bold mb-sm">
              Friends ({friends.length})
            </h3>
            {friends.length === 0 ? (
              <p className="text-dark text-sm m-0">No friends yet.</p>
            ) : (
              <div className="grid gap-sm"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))" }}>
                {friends.map((f) => (
                  <button
                    key={f.id}
                    className="user-card"
                    onClick={() => router.push(`/profile/${f.id}`)}
                  >
                    <img
                      src={f.avatar ? `${API}/uploads/avatars/${f.avatar}` : "/default_avatar.png"}
                      alt=""
                      className="rounded-full object-cover shrink-0"
                      style={{ width: "var(--space-lg)", height: "var(--space-lg)" }}
                    />
                    <span className="w-2.5 h-2.5 rounded-full shrink-0"
                      title={f.isOnline ? "Online" : "Offline"}
                      style={{
                        background: f.isOnline ? "#22c55e" : "#9ca3af",
                        boxShadow: f.isOnline ? "0 0 6px #22c55e" : "none",
                      }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="text-pink font-bold text-base">{f.nickname ?? f.email}</span>{" "}
                      <small className="text-dark text-xs">#{f.id}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}