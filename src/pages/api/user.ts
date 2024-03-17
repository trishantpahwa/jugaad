// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<any>
) {
    try {
        if (request.method !== "GET")
            return response.status(405).json({ message: "Method not allowed" });
        const githubAccessToken = request.headers.authorization ?? null;
        if (!githubAccessToken)
            return response.status(401).json({ message: "Unauthorized" });
        const githubResponse = await axios.get(`https://api.github.com/user`, {
            headers: {
                Authorization: githubAccessToken,
            },
        });
        console.log(githubResponse.data);
        return response.status(200).json({ name: "John Doe" });
    } catch (error) {
        console.error(JSON.stringify(error));
        return response.status(500).json({ message: "Internal server error" });
    }
}

