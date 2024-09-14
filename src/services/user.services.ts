const login = async () => {
  const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&allow_signup=true`;
};

const logout = () => {
  localStorage.removeItem("accessToken");
  window.location.reload();
};

const listMyOwnRepositories = async (accessToken: string) => {
  const response = await fetch(
    "https://api.github.com/user/repos?per_page=100&page=1&visibility=all", // Loop through all pages => TP | 2024-05-18 21:04:02
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const data = await response.json();
  if (data.length > 0) return data;
  else return ["No repositories found"];
};

const fetchUserAuthorization = async (code: string) => {
  const response = await fetch(`/api/github-oauth-callback?code=${code}`);
  const data = await response.json();
  console.log(data);
  if (data.success) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("jwt", data.data.jwt);
    window.location.href = "/";
  }
};

const fetchUser = async (accessToken: string) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (response.status !== 200) {
    localStorage.removeItem("accessToken");
    return;
  }
  const data = await response.json();
  if (!Object.keys(data).find((_) => _ === "message"))
    // Fix this by replacing this to not fetch it with the error => TP | 2024-05-10 14:20:22
    return data;
};

export {
  login,
  logout,
  listMyOwnRepositories,
  fetchUserAuthorization,
  fetchUser
};
