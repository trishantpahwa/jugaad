// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  try {
    if (request.method !== "GET")
      return response.status(405).json({ message: "Method not allowed" });
    const code = request.query.code ?? null;
    if (!code) return response.status(401).json({ message: "Unauthorized" });
    const githubAuthorizationResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        code: code,
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      }
    );
    const accessToken = githubAuthorizationResponse.data
      .split("&")[0]
      .split("=")[1];

    const githubUserResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

    const jwt = sign(
      JSON.stringify({
        username: githubUserResponse.data.login,
        accessToken: accessToken
      }),
      process.env.JWT_SECRET || ""
    );

    return response.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { jwt, accessToken } // Can add refresh token => TP | 2024-05-17 19:55:55
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
