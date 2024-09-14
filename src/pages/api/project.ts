// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";
import { JwtPayload, verify } from "jsonwebtoken";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  try {
    if (request.method !== "PUT")
      return response.status(405).json({ message: "Method not allowed" });
    if (!request.headers.authorization)
      return response.status(401).json({ message: "Unauthorized" });
    const token = request.headers.authorization.split(" ")[1];
    const decryptedJWT = verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JwtPayload;
    if (!decryptedJWT)
      return response.status(401).json({ message: "Unauthorized" });
    if (!request.body.repository || !request.body.username)
      return response.status(422).json({
        message: "Missing repository name or user's name"
      });

    const repository: string = request.body.repository;
    const username: string = request.body.username;

    const { rows } =
      await sql`INSERT INTO "JUGAAD_Projects" ("repository", "username") VALUES (${repository}, ${username}) RETURNING *;`;
    return response.status(200).json({
      success: true,
      message: `Added ${request.body.repository} for contribution successfully`,
      data: {
        project: rows[0]
      }
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}