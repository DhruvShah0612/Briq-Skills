import { Application, Router } from "https://deno.land/x/oak@v13.1.0/mod.ts";
const db = await Deno.openKv();
const API_KEY = Deno.env.get("API_KEY");
const app = new Application();

const nextCall = async (ctx, next) => {
  const authHeader =
    ctx.request.headers["authorization"] ||
    ctx.request.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>
    console.log(token);
    if (token === API_KEY) {
      await next();
    }
  } else {
    ctx.throw(401, "Authorization header missing");
  }
};
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/src`,
      index: "index.html",
    });
  } catch {
    console.log("Not a file");
    await nextCall(ctx, next);
  }
});

const router = new Router();

// The /api/time endpoint returns the current time in ISO format.
router.post("/api/contactus", async (ctx) => {
  const data = await ctx.request.body.json();
  console.log(data);
  const result = await contactus(data);
  ctx.response.body = result;
});

router.post("/api/newsletter", async (ctx) => {
  //   const body = await ctx.request.body.stream;
  //   console.log(body);
  if (!ctx.request.hasBody) {
    ctx.throw(415);
  }
  const data = await ctx.request.body.json();
  console.log(data);
  //   const reqBody = await ctx.request.body({ type: "json" }).value;
  const result = await newsletter(data);
  ctx.response.body = result;
  // ctx.response.body = {
  //   message: "Key-value pair stored successfully",
  // };
});

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });

async function contactus(body) {
  try {
    if (!body || body === null) {
      return { message: "Please specify the key and value", status: 400 };
    }
    await db.set(["contactus", body.email], body);
    return { message: "Data stored successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong", status: 500 };
  }
}

async function newsletter(body) {
  try {
    if (!body || body === null) {
      return { message: "Please specify the key and value", status: 400 };
    }
    await db.set(["newsletter", body.email], body);
    console.log("Key-value pair stored successfully");
    return { message: "Data stored successfully", status: 200 };
    // ctx.response.body = {
    //   message: "Key-value pair stored successfully",
    //   status: 200,
    // };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong", status: 500 };
  }
}
