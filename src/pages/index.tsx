import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<any>(null);

  const signIn = async () => {
    const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&allow_signup=true`;
  };

  const signOut = () => {
    localStorage.removeItem("accessToken");
    setAccessToken("");
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setUser(data);
    };
    if (accessToken) fetchUser();
  }, [accessToken]);

  useEffect(() => {
    const fetchUserRepos = async () => {
      const response = await fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json(); // Add pagination while scrolling => TP | 2024-03-17 15:36:50
      setRepositories(data);
    };
    if (user) fetchUserRepos();
  }, [user]);

  const code = useRouter().query.code;

  useEffect(() => {
    const fetchUserAuthorization = async () => {
      const response = await fetch(`/api/github-oauth-callback?code=${code}`);
      const data = await response.json();
      if (data.success)
        localStorage.setItem("accessToken", data.data.accessToken);
      setTimeout(() => (window.location.href = "/"), 1000);
    };
    if (code) fetchUserAuthorization();
  }, [code]);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken") ?? "");
  }, []);

  return (
    <>
      <div className="flex h-[100vh] w-full items-center justify-center">
        {user === null ? (
          <div
            onClick={signIn}
            className="github-icon transform cursor-pointer rounded-full shadow-lg transition duration-300 ease-in-out hover:scale-125 hover:shadow-xl active:scale-75"
          ></div>
        ) : (
          <div className="flex h-[75vh] w-[75vw] flex-col items-center justify-center gap-5 rounded-lg bg-red-100">
            <h1>Welcome, {user?.name}</h1>
            <h3>Your repositories:</h3>
            <ul>
              {repositories?.map((repo: any, index: number) => (
                <li key={index}>{repo.name}</li>
              ))}
            </ul>
            <button onClick={signOut}>Sign Out</button>
          </div>
        )}
      </div>
    </>
  );
}
