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
        const code = request.query.code ?? null;
        if (!code)
            return response.status(401).json({ message: "Unauthorized" });
        const githubAuthorizationResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                code: code,
                client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
            }
        );
        const accessToken = githubAuthorizationResponse.data
            .split("&")[0]
            .split("=")[1];

        return response.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: { accessToken },
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error" });
    }
}
