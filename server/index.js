import { serve } from "https://deno.land/std@0.155.0/http/server.ts";

import { Application } from "https://deno.land/x/oak@v10.2.0/mod.ts";

const db = await Deno.openKv();
const API_KEY = Deno.env.get("API_KEY");
const common_headers = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin"
    );
    return new Response(null, {
      headers,
      status: 200,
    });
  }
  const authorizationHeader = req.headers.get("Authorization");
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.slice("Bearer ".length);
    if (isValidToken(token)) {
      return await parseRequest(req);
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  }
  // check if the request is for the storeKeyValue
});

async function parseRequest(req) {
  if (req.method === "POST" && req.url.includes("/contactus")) {
    console.log("contactus");
    const reqdata = await req.json();
    const data = reqdata.data;
    console.log("Received POST data:", data);
    if (data.length > 0) {
      // request key and value from the request body
      try {
        const res = await Promise.all(
          data.map(async (item) => {
            const { key, value } = item;
            const { message, status } = await storeKeyValue(
              "contactus",
              key,
              value
            );
            console.log("storeKeyValue res", message, status);
          })
        );
        console.log("res", res);
        // store the key value pair in the database
        return new Response(
          JSON.stringify({ message: "Successfully added key and values" }),
          {
            status: 200,
            headers: common_headers,
          }
        );
      } catch (error) {
        console.log("storeKeyValue error", error);
        return new Response(
          JSON.stringify({ message: "Something went wrong" }),
          { status: 500, headers: common_headers }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ message: "Please specify the key and value" }),
        { status: 400, headers: common_headers }
      );
    }
  } else if (req.method === "POST" && req.url.includes("/newsletter")) {
    console.log("newsletter");
    const reqdata = await req.json();
    const data = reqdata.data;
    console.log("Received POST data:", data);
    if (data.length > 0) {
      // request key and value from the request body
      try {
        const res = await Promise.all(
          data.map(async (item) => {
            const { key, value } = item;
            const { message, status } = await storeKeyValue(
              "newsletter",
              key,
              value
            );
            console.log("storeKeyValue res", message, status);
          })
        );
        console.log("res", res);
        // store the key value pair in the database
        return new Response(
          JSON.stringify({ message: "Successfully added key and values" }),
          {
            status: 200,
            headers: common_headers,
          }
        );
      } catch (error) {
        console.log("storeKeyValue error", error);
        return new Response(
          JSON.stringify({ message: "Something went wrong" }),
          { status: 500, headers: common_headers }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ message: "Please specify the key and value" }),
        { status: 400, headers: common_headers }
      );
    }
  } else {
    const app = new Application();

    // First we try to serve static files from the _site folder. If that fails, we
    // fall through to the router below.
    app.use(async (ctx, next) => {
      try {
        await ctx.send({
          root: `${Deno.cwd()}/src`,
          index: "index.html",
        });
      } catch {
        next();
      }
    });

    await app.listen({ port: 8000 });
  }
}
function isValidToken(token) {
  // check if the token is valid
  if (token === API_KEY) {
    return true;
  }
}

async function storeKeyValue(parentkey, key, value) {
  try {
    if (!key || key === null || value === null) {
      return { message: "Please specify the key and value", status: 400 };
    }
    await db.set([parentkey, key], value);
    return { message: "Key-value pair stored successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong", status: 500 };
  }
}
