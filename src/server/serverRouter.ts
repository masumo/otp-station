import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "./context";
import { publicProcedure, router } from './trpc';
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const serverRouter = router({
    findAll: publicProcedure.query( async () => {
                return await prisma.customerList.findMany();
            }),
    findFirst: publicProcedure
                .input(
                    z.object({
                    account: z.string(),
                    })
                )
                .query( async ({input}) => {
                    return await prisma.customerList.findFirst({
                        where: {
                            account: input.account,
                          },
                    });
                }),
    insertOne: publicProcedure
                .input(
                    z.object({
                    account: z.string(),
                    })
                )
                .mutation( async ({ input }) => {
                    return await prisma.customerList.create({
                    data: { account: input.account },
                    });
                }),
    updateOne: publicProcedure
                .input( 
                    z.object({
                    id: z.string(),
                    account: z.string(),
                    checked: z.boolean(),
                    })
                )
                .mutation( async ({ input }) => {
                        const { id, ...rest } = input;
                        return await prisma.customerList.update({
                        where: { id },
                        data: { ...rest },
                    });
                }),
    deleteOne: publicProcedure
                .input( 
                    z.object({
                    id: z.string(),
                    account: z.string(),
                    checked: z.boolean(),
                    })
                )
                .mutation( async ({ input }) => {
                        const { id, ...rest } = input;
                        return await prisma.customerList.delete({
                        where: { id },
                    });
                }),
    deleteAll: publicProcedure
                .input(
                    z.object({
                    ids: z.string().array(),
                    }),
                )
                .mutation( async ({ input }) => {
                    const { ids } = input;
                    return await prisma.customerList.deleteMany({
                        where: {
                        id: { in: ids },
                        },
                     });
                })
});

export type ServerRouter = typeof serverRouter;