"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
import { fetchWithRefresh } from "../lib/fetchWithRefresh";

const API = "/api";
const MAX_MESSAGE_LENGTH = 1000;

export default function ChatPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socketRef = useRef(null);
  const meRef = useRef(null);
  const activeRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithRefresh(`${API}/users/me`);
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const meData = await res.json();
        setMe(meData);
        meRef.current = meData;
        const fr = await fetchWithRefresh(`${API}/users/${meData.id}/friends`);
        if (fr.ok) setFriends(await fr.json());
      } catch {
        router.push("/login");
      }
    })();
  }, [router]);
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (friends.length === 0 || autoSelectedRef.current) return;
    const fid = new URLSearchParams(window.location.search).get("friend");
    if (!fid) return;
    const f = friends.find((x) => String(x.id) === String(fid));
    if (f) {
      setActiveFriend(f);
      autoSelectedRef.current = true; 
    }
  }, [friends]);

  useEffect(() => {
    if (!me) return;
    const socket = io(`https://${window.location.hostname}:8443/chat`, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      forceNew: true,
    });
    socketRef.current = socket;

    // Si le serveur coupe (jwt expiré), on renouvelle le jwt et on se reconnecte.
    let authRetry = false;
    socket.on("connect", () => {
      authRetry = false;
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect" && !authRetry) {
        authRetry = true;
        fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
          .then((r) => {
            if (r.ok) socket.connect();
          })
          .catch(() => {});
      }
    });

    socket.on("newMessage", (msg) => {
      const meId = meRef.current?.id;
      const friend = activeRef.current;
      if (!friend) return;
      const inThisConvo =
        (msg.senderId === friend.id && msg.receiverId === meId) ||
        (msg.senderId === meId && msg.receiverId === friend.id);
      if (inThisConvo) setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [me]);

  // online/offline friends list.
  useEffect(() => {
    if (!me) return;
    const socket = io(`https://${window.location.hostname}:8443/presence`, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      forceNew: true,
    });

    let authRetry = false;
    socket.on("connect", () => {
      authRetry = false;
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect" && !authRetry) {
        authRetry = true;
        fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
          .then((r) => {
            if (r.ok) socket.connect();
          })
          .catch(() => {});
      }
    });

    socket.on("presence", ({ userId, isOnline }) => {
      setFriends((prev) =>
        prev.map((f) => (f.id === userId ? { ...f, isOnline } : f)),
      );
    });
    return () => socket.disconnect();
  }, [me]);

  useEffect(() => {
    activeRef.current = activeFriend;
    if (!activeFriend) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRefresh(`${API}/chat/${activeFriend.id}`);
        if (!cancelled && res.ok) setMessages(await res.json());
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeFriend]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    const content = input.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content || !activeFriend || !socketRef.current) return;
    socketRef.current.emit("sendMessage", {
      receiverId: activeFriend.id,
      content,
    });
    setInput("");
  }


  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* HEADER */}
        <div className="flex flex-col gap-sm">
          <h1 className="press-start-title text-orange">
            Messages
          </h1>
          <Link href="/jeu" className="profile-button secondary self-start">
            Home
          </Link>
        </div>

        {/* LAYOUT */}
        <div className="messages-layout">

          {/* FRIENDS */}
          <section className="card friends-card max-h-[40vh] overflow-y-auto">
            <h2 className="card-title">Friends</h2>
            {friends.length === 0 ? (
              <p className="profile-message">No friends yet.</p>
            ) : (
              <div className="friends-list">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFriend(f);
                      const url = new URL(window.location.href);
                      url.searchParams.set("friend", f.id);
                      window.history.replaceState({}, "", url.toString());
                    }}
                    className={`friend-item ${activeFriend?.id === f.id ? "active" : ""}`}
                  >
                    <img
                      src={f.avatar ? `${API}/uploads/avatars/${f.avatar}` : "/default_avatar.png"}
                      alt=""
                    />
                    <span className={`status-dot ${f.isOnline ? "online" : "offline"}`} />
                    <span className="friend-name">{f.nickname ?? f.email}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* CHAT */}
          <section className="card chat-card">
            {!activeFriend ? (
              <div className="chat-empty">Pick a friend to start chatting</div>
            ) : (
              <>
                {/*Header chat*/}
                <div className="chat-header">
                  {activeFriend.nickname ?? activeFriend.email}
                </div>
                {/*Header messages*/}

                <div className="chat-messages max-h-[40vh] overflow-y-auto">
                  {messages.map((m) => {
                    const mine = m.senderId === me?.id;
                    return (
                      <div key={m.id} className={`bubble ${mine ? "mine" : "theirs"} break-words whitespace-pre-wrap`}>
                        {m.content}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendMessage} className="chat-input">
                  <label htmlFor="chat-message" style={{ display: 'none' }}>
                    Message
                  </label>
                  <input
                    id="chat-message"
                    name="message"
                    autoComplete="off"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="Type a message..."
                    className="input-box flex-1"
                  />
                  <span className="text-xs text-[#fad3a8] self-center">
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                  <button type="submit" className="profile-button primary w-auto">
                    Send
                  </button>
                </form>
              </>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
