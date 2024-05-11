import { KeyboardEventHandler, useEffect, useState } from "react";
import { useRouter } from "next/router";
import figlet from "figlet";

// CLI component => TP | 2024-03-20 00:55:46
interface IHistory {
	command: string;
	args: string[];
	output: string | string[];
};

export default function Home() {
	const [accessToken, setAccessToken] = useState("");
	const [user, setUser] = useState<any>(null);
	const [repositories, setRepositories] = useState<any>(null);
	const [history, setHistory] = useState<IHistory[]>([]);
	const [input, setInput] = useState("");
	const [prompt, setPrompt] = useState(`${user ? user.name : "guest"}@jugaad:~$`);
	const [textArt, setTextArt] = useState("");
	const [userAgent, setUserAgent] = useState("");

	const code = useRouter().query.code;

	const clearInput = () => setInput("");
	const clearHistory = () => setHistory([]);

	const executeCommand: KeyboardEventHandler<HTMLInputElement> = (e) => {
		switch (e.key) {
			case "Enter":
				const _input = input.trim().split(" ")[0];
				const args: string[] = input.split(" ").slice(1);
				let output: string | string[] = "";
				if (_input === "clear") {
					clearHistory();
				} else {
					switch (_input) {
						case "":
							output = "";
							break;
						case "ls": // Add flags for ls => TP | 2024-05-10 23:03:59
							if (user)
								output = repositories.map((repository: any) => repository.name);
							else output = "Please login to view repositories";
							break;
						case "history":
							output = history.filter(historyItem => historyItem.command != `${prompt} `).map((historyItem, index) => `${index + 1}. ${historyItem.command.slice(prompt.length + 1)}`);
							break;
						case "login":
							login();
							break;
						case "logout":
							logout();
							break;
						case "help":
							output = [
								"ls - List repositories",
								"open - Open repository in browser",
								"clear - Clear history",
								"history - Show history",
								"login - Login with GitHub",
								"logout - Logout",
								"help - Show help",
							];
							break;
						case "open":
							if (args.length > 0) {
								window.open(`https://github.com/${user.login}/${args[0]}/issues`);
								output = "Opening...";
							} else output = "Usage: open <repository>";
							break;
						case "add-for-contribution":
							if (args.length > 0) {
								output = "Adding...";
								addForContribution(args[0]);
							} else output = "Usage: add-for-contribution <repository>";
							break;
						default:
							output = "Command not found, type 'help' for a list of commands";
							break;
					}
					setHistory([...history, { command: `${prompt} ${_input} ${args.join(" ")}`, args: args, output: output }]);
				}
				clearInput();
				break;
			case "ArrowUp":
				if (history.length > 0) setInput(history[history.length - 1].command.slice(prompt.length + 1));
				break;
			case "ArrowDown":
				// setInput(history[history.length - 1].command.slice(prompt.length + 1)); // Fix underflow => TP | 2024-03-20 02:19:27
				break;
			case "":
				break;
			default:
				break;
		}
	}

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
		const _repository = repositories.find((r: any) => r.name === repository);
		if (_repository) {
			const response = await fetch("/api/project", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					repository: _repository,
					user: user,
				}),
			});
			const data = await response.json();
			console.log(data);
		}
		else console.log("Repository not found");
	};

	useEffect(() => {
		const fetchUser = async () => {
			const response = await fetch("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const data = await response.json();
			if (!Object.keys(data).find(_ => _ === "message"))  // Fix this by replacing this to not fetch it with the error => TP | 2024-05-10 14:20:22
				setUser(data);
		};
		if (accessToken) fetchUser();
	}, [accessToken]);

	useEffect(() => {
		const fetchUserRepos = async () => {
			const response = await fetch("https://api.github.com/user/repos?per_page=100&page=1&visibility=all", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const data = await response.json(); // Add pagination while scrolling => TP | 2024-03-17 15:36:50
			setRepositories(data);
		};
		if (user) {
			setPrompt(`${user.name}@jugaad:~$`);
			fetchUserRepos();
		} else setPrompt("guest@jugaad:~$");
	}, [user]);

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
		function generateTextArt() {
			figlet.text("Jugaad", (err: any, data: any) => setTextArt(data));
			if (window) setUserAgent(window.navigator.userAgent);
		}
		function setLoginSession() {
			setAccessToken(localStorage.getItem("accessToken") ?? "");
		}
		generateTextArt();
		setLoginSession();
	}, []);

	return (
		<>
			<div className="h-full min-h-screen w-full bg-black text-white scroll-auto p-2">
				{userAgent}
				<pre>{textArt}</pre>
				<br />
				<pre>This is a site for finding projects to contribute to.</pre>
				<pre>
					Last login: {new Date().toUTCString()} on dev0
				</pre>
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
				<div className="w-full flex">
					<p className="text-nowrap">
						{prompt}&nbsp;
					</p>
					<input
						type="text"
						value={input}
						onKeyDown={executeCommand}
						onChange={(e) => setInput(e.target.value)}
						spellCheck={false}
						autoComplete="off"
						autoCapitalize="off"
						className="w-full bg-black text-white border-none outline-none"
						autoFocus
					/>
				</div>
			</div>
		</>
	);
}