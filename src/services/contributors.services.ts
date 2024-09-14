const listContributors = async (
  username: string,
  repository: string,
  jwt: string
) => {
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

export { listContributors };
