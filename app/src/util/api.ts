import createHttpError from "http-errors";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { db } from "@/models";
import { ValidationError } from "sequelize";

export function apiHandler(handler: (req: NextRequest, props: { params: Record<string, string> }) => Promise<NextResponse>) {
  return async (req: NextRequest, props: { params: Record<string, string> }) => {
    try {
      if (!db.initialized) {
        await db.initialize();
      }

      // TODO JWT authentication logic here
      // await jwtMiddleware(req);

      return await handler(req, props);
    } catch (err) {
      return errorHandler(err, req);
    }
  };
}

function errorHandler(err: unknown, req: NextRequest) {
  console.error(err);
  if (createHttpError.isHttpError(err) && err.expose) {
    return NextResponse.json({ error: { message: err.message } }, { status: err.statusCode });
  } else if (err instanceof ZodError) {
    return NextResponse.json({ error: { message: 'Invalid request', issues: err.issues } }, { status: 400 });
  } else if (err instanceof ValidationError && err.name === 'SequelizeUniqueConstraintError') {
    return NextResponse.json({ error: { message: 'Entity exists already.', issues: err.errors } }, { status: 400 });
  } else {
    return NextResponse.json({ error: { nessage: 'Internal server error', error: err } }, { status: 500 });
  }
}

