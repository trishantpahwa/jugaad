const contributeToProject = async (
  username: string,
  repository: string,
  jwt: string
) => {
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

const openProjectIssues = (username: string, repository: string) => {
  window.open(`https://github.com/${username}/${repository}/issues`);
  return "Opening...";
};

const addForContribution = async (
  username: string,
  repository: any,
  jwt: string
) => {
  const response = await fetch("/api/project", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify({
      repository: repository,
      username: username
    })
  });
  if (response.status === 200) {
    const data = await response.json();
    return data.message;
  } else return ["Failed to add repository for contribution"];
};

const listProjectsThatIHaveContributedTo = async (jwt: string) => {
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

const listProjectsAvailableForContribution = async (jwt: string) => {
  const response = await fetch("/api/projects", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`
    }
  });
  const data = await response.json();
  if (data.data.projects.length > 0) {
    return data.data.projects;
  } else return ["No projects available for contribution"];
};

export {
  contributeToProject,
  openProjectIssues,
  addForContribution,
  listProjectsThatIHaveContributedTo,
  listProjectsAvailableForContribution
};
