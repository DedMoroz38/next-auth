import { PrismaClient } from '@prisma/client'
import {z} from 'zod'

export const ProductCreateInput = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        query: {
            user: {
                create({ args, query }) {
                    args.data = ProductCreateInput.parse(args.data)
                    return query(args)
                },
            }
        }
    })
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma