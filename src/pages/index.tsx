import { KeyboardEventHandler, useEffect, useState } from "react";
import { useRouter } from "next/router";
import figlet from "figlet";

// CLI component => TP | 2024-03-20 00:55:46
interface IHistory {
  command: string;
  args: string[];
  output: string | string[];
}

interface IProject {
  id: number;
  name: string;
  username: string;
  createdAt: string;
}

interface IProjects {
  self: IProject[];
  available: IProject[];
}

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [jwt, setJWT] = useState("");
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<IProjects>({
    self: [],
    available: []
  });
  const [history, setHistory] = useState<IHistory[]>([]);
  const [historyScrollIndex, setHistoryScrollIndex] = useState(0);
  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState(
    `${user ? user.name : "guest"}@jugaad:~$`
  );
  const [textArt, setTextArt] = useState("");
  const [userAgent, setUserAgent] = useState("");

  const code = useRouter().query.code;

  const clearInput = () => setInput("");
  const clearHistory = () => setHistory([]);

  const executeCommand: KeyboardEventHandler<HTMLInputElement> = async (e) => {
    switch (e.key) {
      case "Enter":
        const _input = input.trim().split(" ")[0];
        const args: string[] = input.split(" ").slice(1);
        let output: string | string[] = "";
        if (_input === "clear") {
          clearHistory();
        } else {
          switch (_input.toLowerCase()) {
            case "": // Add emoticon, faces => TP | 2024-05-17 20:52:45
              output = "";
              break;
            case "ls":
              if (args.length > 0) {
                switch (args[0]) {
                  case "--self":
                    const _repositories = await listMyOwnRepositories();
                    output = _repositories.map(
                      (repository: any) => repository.name
                    );
                    break;
                  default:
                    output =
                      "Usage: ls [--self | --contributors <username/repository>]";
                    break;
                }
              } else {
                const _repositories =
                  await listProjectsAvailableForContribution(); // Get repositories that are having the same tags as the tags of the technologies associated with the user, and add indentation. => TP | 2024-05-19 19:38:16
                if (
                  _repositories[0] === "No projects available for contribution"
                ) {
                  output = _repositories;
                } else {
                  output = [
                    "username repository",
                    ..._repositories.map(
                      (repository: any) =>
                        `${repository.username} ${repository.repository}`
                    )
                  ];
                }
              }
              break;
            case "contributors":
              const [username, repository] = args[1].split("/");
              if (username && repository) {
                const _contributors = await listContributors(
                  username,
                  repository
                );
                output = _contributors.map(
                  (contributor: any) =>
                    `${repository} ${contributor.username} ${new Date(contributor.createdAt).toLocaleDateString().replaceAll("/", "-")} ${new Date(contributor.createdAt).toLocaleTimeString()}`
                ); // Format/Display/Indent map properly. => TP | 2024-05-18 22:04:52
              } else {
                output = ["Enter a valid username and repository"];
              }
              break;
            case "contributions":
              output = await listProjectsThatIHaveContributedTo();
              break;
            case "contribute":
              if (args.length === 1) {
                const [username, repository] = args[0].split("/");
                if (username && repository) {
                  output = await contributeToProject(username, repository);
                } else output = ["Enter a valid username and repository"];
              } else {
                output = ["Usage: contribute <username/repository>"];
              }
              break;
            case "history":
              output = history
                .filter((historyItem) => historyItem.command != `${prompt} `)
                .map(
                  (historyItem, index) =>
                    `${index + 1}. ${historyItem.command.slice(prompt.length + 1)}`
                );
              break;
            case "login":
              login();
              break;
            case "logout":
              logout();
              break;
            case "open":
              if (args.length > 0) {
                window.open(
                  `https://github.com/${user.login}/${args[0]}/issues`
                );
                output = "Opening...";
              } else output = "Usage: open <repository>";
              break;
            case "add-for-contribution":
              if (args.length > 0) output = await addForContribution(args[0]);
              else output = "Usage: add-for-contribution <repository>";
              break;
            case "help":
              output = [
                "Available commands:",
                "clear - Clear command history",
                "ls [--self | --contributors <username/repository>] - List available projects or your own repositories",
                "contributors <username/repository> - List contributors of a repository",
                "contributions - List projects that you have contributed to",
                "contribute <username/repository> - Contribute to a project",
                "history - View command history",
                "login - Log in with GitHub",
                "logout - Log out",
                "open <repository> - Open the issues page of a repository",
                "add-for-contribution <repository> - Add a repository for contribution",
                "help - Display this help text"
              ];
              break;
              output = "Command not found, type 'help' for a list of commands";
              break;
          }
          setHistory([
            ...history,
            {
              command: `${prompt} ${_input} ${args.join(" ")}`,
              args: args,
              output: output
            }
          ]);
        }
        clearInput();
        break;
      case "ArrowUp":
        if (history.length > 0) {
          setHistoryScrollIndex((_) => (_ > 0 ? _ - 1 : _));
          setInput(
            history[historyScrollIndex].command.slice(prompt.length + 1)
          );
        }
        break;
      case "ArrowDown":
        setHistoryScrollIndex((_) => (_ < history.length - 1 ? _ + 1 : _));
        setInput(history[historyScrollIndex].command.slice(prompt.length + 1));
        break;
      case "":
        break;
      default:
        break;
    }
  };

  const login = async () => {
    const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&allow_signup=true`;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken("");
    setUser(null);
  };

  const addForContribution = async (repository: any) => {
    const _repository = repositories.self.find(
      (r: any) => r.name === repository
    );
    if (_repository) {
      const response = await fetch("/api/project", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
          repository: _repository.name,
          username: user.login
        })
      });
      if (response.status === 200) {
        const data = await response.json();
        return data.message;
      } else return ["Failed to add repository for contribution"];
    } else return ["Repository not found"];
  };

  const listProjectsThatIHaveContributedTo = async () => {
    const response = await fetch("/api/contributions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`
      }
    });
    const data = await response.json();
    if (data.contributions.length > 0) return data.data.contributions;
    else return ["There are no projects that are contributed to"];
  };

  const listProjectsAvailableForContribution = async () => {
    if (repositories.available.length > 0) return repositories.available;
    else {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        }
      });
      const data = await response.json();
      if (data.data.projects.length > 0) {
        setRepositories((_: IProjects) => {
          return {
            ..._,
            available: data.data.projects
          };
        });
        return data.data.projects;
      } else return ["No projects available for contribution"];
    }
  };

  const listMyOwnRepositories = async () => {
    if (repositories.self.length > 0) return repositories.self;
    else {
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100&page=1&visibility=all", // Loop through all pages => TP | 2024-05-18 21:04:02
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      if (data.length > 0) {
        setRepositories((_: IProjects) => {
          return {
            ..._,
            self: data
          };
        });
        return data;
      } else return ["No repositories found"];
    }
  };

  const listContributors = async (username: string, repository: string) => {
    const response = await fetch(
      `/api/contributors?username=${username}&repository=${repository}`,
      {
        headers: {
          method: "GET",
          Authorization: `Bearer ${jwt}`
        }
      }
    );
    const data = await response.json();
    if (data.data.contributors.length > 0) return data.data.contributors;
    else return ["No contributors found"];
  };

  const contributeToProject = async (username: string, repository: string) => {
    if (username === user.login)
      return ["You cannot contribute to your own project"];
    const response = await fetch(`/api/contributor`, {
      method: "PUT",
      body: JSON.stringify({
        username,
        repository
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`
      }
    });
    const data = await response.json();
    if (data.success) return ["Contributed successfully"];
    else return ["Failed to contribute"];
  };

  useEffect(() => {
    setHistoryScrollIndex((_) => history.length - 1);
  }, [history]);

  useEffect(() => {
    const fetchUser = async () => {
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
        setUser(data);
    };
    if (accessToken) fetchUser();
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      setPrompt(`${user.name}@jugaad:~$`);
    } else setPrompt("guest@jugaad:~$");
  }, [user]);

  useEffect(() => {
    const fetchUserAuthorization = async () => {
      const response = await fetch(`/api/github-oauth-callback?code=${code}`);
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("jwt", data.data.jwt);
        window.location.href = "/";
      }
    };
    if (code) fetchUserAuthorization();
  }, [code]);

  useEffect(() => {
    function generateTextArt() {
      figlet.text("Jugaad", (err: any, data: any) => setTextArt(data));
      if (window) setUserAgent(window.navigator.userAgent);
    }
    function setLoginSession() {
      setAccessToken(localStorage.getItem("accessToken") ?? "");
      setJWT(localStorage.getItem("jwt") ?? "");
    }
    generateTextArt();
    setLoginSession();
  }, []);

  return (
    <>
      <div className="h-full min-h-screen w-full scroll-auto p-2">
        {userAgent}
        <pre>{textArt}</pre>
        <br />
        <pre>This is a site for finding projects to contribute to.</pre>
        {history.map((_command, index) => {
          return (
            <div key={index}>
              <div className="executed-command">{`${_command.command}`}</div>
              <div className="flex flex-col">
                {Array.isArray(_command.output) ? (
                  _command.output.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))
                ) : (
                  <div>{_command.output}</div>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex">
          <p className="text-nowrap">{prompt}&nbsp;</p>
          <input
            type="text"
            value={input}
            onKeyDown={executeCommand}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-grow border-none outline-none"
            autoFocus
          />
        </div>
      </div>
    </>
  );
}
