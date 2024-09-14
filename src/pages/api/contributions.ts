// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";
import { JwtPayload, verify } from "jsonwebtoken";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  try {
    if (request.method !== "GET")
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

    const contributions =
      await sql`SELECT * FROM "Contributors" INNER JOIN "Projects" ON "Contributors"."projectID" = "Projects"."id" WHERE "Projects"."username"=${decryptedJWT.username};`;

    return response.status(200).json({
      success: true,
      data: {
        contributions: contributions.rows
      }
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
