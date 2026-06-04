const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.argv[2] || process.env.PORT || 8082);
const root = path.resolve(__dirname, "..", "dist");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ttf": "font/ttf"
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const route = requestPath === "/" ? "/index.html" : requestPath;
  let filePath = path.join(root, route);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      filePath = path.join(root, "index.html");
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
      });
      response.end(data);
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Spenza Expo preview running at http://localhost:${port}`);
});

process.on("beforeExit", (code) => {
  console.log(`Preview server beforeExit: ${code}`);
});

process.on("exit", (code) => {
  console.log(`Preview server exit: ${code}`);
});

setInterval(() => undefined, 60 * 1000);
