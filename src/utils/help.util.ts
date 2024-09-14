export default function generateHelpText() {
  return [
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
}
