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

    const username = request.body.username;
    const repository = request.body.repository;

    if (!username || !repository)
      return response.status(422).json({
        success: false,
        message: "Missing repository username or repository"
      });

    if (username === decryptedJWT.username)
      // Check for server-side to avoid API access from external source => TP | 2024-06-06 16:56:48
      return response.status(401).json({
        success: false,
        message: "You are the owner of the project"
      });

    const project = await sql`
        SELECT * FROM "Projects" WHERE "username" = ${username} AND "repository" = ${repository};
      `;

    if (project.rowCount === 0)
      return response.status(404).json({ message: "Project not found" });

    const contributor = await sql`
        INSERT INTO "Contributors" ("projectID", "username")
        VALUES (${project.rows[0].id}, ${decryptedJWT.username})
        RETURNING *
        `;
    return response.status(201).json({
      success: true,
      message: `Added user as a contributor to ${project.rows[0].name} successfully`,
      data: {
        contributor: contributor.rows[0]
      }
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
