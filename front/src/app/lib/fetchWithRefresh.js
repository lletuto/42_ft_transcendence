/*The back sends a JWT token that expires after 15 min, when it 
expires it sends an error 401. This function has to intercept the 
401 error and call api/auth/refresh which will create a new JWT token.*/

let refreshPromise = null;
let lastRefreshAt = 0;

export async function fetchWithRefresh(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status !== 401) {
    // console.log("fetchWithRefresh: response is not 401, returning response");
    return response;
  }

  if (url === "/api/auth/refresh") {
    return null;
  }

  if (!refreshPromise && Date.now() - lastRefreshAt < 3000) {
    return fetch(url, { ...options, credentials: "include" });
  }

  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      lastRefreshAt = Date.now();
      refreshPromise = null;
    });
  }

  const refreshResponse = await refreshPromise;

  if (!refreshResponse.ok) {
    return refreshResponse;
  }

  response = await fetch(url, {
    ...options,
    credentials: "include",
  });
  return response;
}
