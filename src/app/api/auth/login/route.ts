import prisma from "@/db";
import {NextApiRequest, NextApiResponse} from "next";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const user = prisma.user.findFirst({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  })
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' })
    return
  }
  res.status(200).json({ message: 'success' })
}
