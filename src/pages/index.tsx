import { KeyboardEventHandler, useEffect, useState } from "react";
import { IHistory, IProjects } from "@/interfaces";
import {
  addForContribution,
  clearHistory,
  fetchUser,
  fetchUserAuthorization,
  listContributors,
  listMyOwnRepositories,
  listProjectsAvailableForContribution,
  listProjectsThatIHaveContributedTo,
  login,
  logout,
  openProjectIssues,
} from "@/services";
import { generateHelpText, generateTextArt } from "@/utils";
import { useRouter } from "next/router";
import { getAuth } from "@/providers";

export default function Home() {
  const code = useRouter().query.code;

  const auth = getAuth();

  const [history, setHistory] = useState<IHistory[]>([]);
  const [userAgent, setUserAgent] = useState("");
  const [textArt, setTextArt] = useState<string | undefined>("");
  const [user, setUser] = useState<any>(null); // Make interface for this => TP
  const [input, setInput] = useState("");
  const [historyScrollIndex, setHistoryScrollIndex] = useState(0);
  const [accessToken, setAccessToken] = useState(""); // Might not be needed => TP | 2024-09-14 16:19:55
  const [jwt, setJWT] = useState(""); // Might not be needed, check usage => TP | 2024-09-14 16:19:47
  const [prompt, setPrompt] = useState(
    `${user ? user.name : "guest"}@jugaad:~$`
  );
  const [repositories, setRepositories] = useState<IProjects>({
    self: [],
    available: [],
  });

  const isAuthenticated = () => (user ? true : false);

  const clearInput = () => setInput("");

  const executeCommand: KeyboardEventHandler<HTMLInputElement> = async (e) => {
    switch (e.key) {
      case "Enter":
        const _input = input.trim().split(" ")[0].toLowerCase();
        const args: string[] = input.split(" ").slice(1);
        var output: string | string[] = "";
        switch (_input) {
          case "": // Add emoticon, faces => TP | 2024-05-17 20:52:45
            output = "";
            break;
          case "clear":
            clearHistory(setHistory);
            break;
          case "ls":
            if (!isAuthenticated())
              return ["Please login to view available projects"];
            if (args.length > 0) {
              switch (args[0]) {
                case "--self":
                  if (repositories.self.length > 0) return repositories.self;
                  else {
                    const _repositories =
                      await listMyOwnRepositories(accessToken);
                    if (_repositories[0] !== "No repositories found")
                      setRepositories((_: IProjects) => {
                        return {
                          ..._,
                          self: _repositories,
                        };
                      });
                    output = _repositories.map(
                      (repository: any) => repository.name
                    );
                  }
                  break;
                default:
                  output =
                    "Usage: ls [--self | --contributors <username/repository>]";
                  break;
              }
            } else {
              if (!isAuthenticated())
                return ["Please login to view available projects"];
              if (repositories.available.length > 0)
                return repositories.available;
              else {
                const _projects =
                  await listProjectsAvailableForContribution(jwt); // Get repositories that are having the same tags as the tags of the technologies associated with the user, and add indentation. => TP | 2024-05-19 19:38:16
                if (_projects[0] === "No projects available for contribution") {
                  output = _projects;
                } else {
                  setRepositories((_: IProjects) => {
                    return {
                      ..._,
                      available: _projects,
                    };
                  });
                  output = [
                    "username repository",
                    ..._projects.map(
                      (repository: any) =>
                        `${repository.username} ${repository.repository}`
                    ),
                  ];
                }
              }
            }
            break;
          case "contributors":
            const [username, repository] = args[1].split("/");
            if (username && repository) {
              const _contributors = await listContributors(
                username,
                repository,
                jwt
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
            output = await listProjectsThatIHaveContributedTo(jwt);
            break;
          case "contribute":
            if (args.length === 1) {
              const [username, repository] = args[0].split("/");
              if (username && repository) {
                if (username === user.login)
                  return ["You cannot contribute to your own project"];
                else return ["Add code for contributing to the project."];
              } else output = ["Enter a valid username and repository"];
            } else {
              output = ["Usage: contribute <username/repository>"];
            }
            break;
          case "add-for-contribution":
            if (args.length > 0) {
              const _repository = repositories.self.find(
                (r: any) => r.name === repository
              );
              if (_repository) {
                output = await addForContribution(
                  user.login,
                  _repository.name,
                  jwt
                );
              } else return ["Repository not found"];
            } else output = "Usage: add-for-contribution <repository>";
            break;
          case "open":
            if (args.length > 0) {
              output = openProjectIssues(user.login, args[0]);
            } else output = "Usage: open <repository>";
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
          case "help":
            output = generateHelpText();
            break;
          default:
            output = "Command not found, type 'help' for a list of commands";
            break;
        }
        setHistory([
          ...history,
          {
            command: `${prompt} ${_input} ${args.join(" ")}`,
            args: args,
            output: output,
          },
        ]);
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
      default:
        console.log("default, impossible case");
        break;
    }
  };

  useEffect(() => {
    setHistoryScrollIndex((_) => history.length - 1);
  }, [history]);

  useEffect(() => {
    // Temporary code, organize this => TP | 2024-09-14 16:22:51
    var _fetchUserAuthorization = fetchUserAuthorization;
    if (code) _fetchUserAuthorization(code.toString());
  }, [code]);

  useEffect(() => {
    var _fetchUser = fetchUser;
    if (!isAuthenticated() && accessToken) {
      _fetchUser(accessToken)
        .then((data) => {
          setUser(data);
        })
        .catch((error) =>
          console.log("Error: Unable to fetch user......." + error)
        );
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      setPrompt(`${user.name}@jugaad:~$`);
    } else setPrompt("guest@jugaad:~$");
  }, [user]);

  useEffect(() => {
    if (auth.accessToken) setAccessToken(auth.accessToken);
    if (auth.jwt) setJWT(auth.jwt);
  }, [auth]);

  useEffect(() => {
    var _generateTextArt = generateTextArt;
    _generateTextArt(setTextArt);
    if (window) setUserAgent(window.navigator.userAgent);
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
