const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Proxy API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://iotgreenhouse.vercel.app/api/data",
    changeOrigin: true,
    secure: true,
    logLevel: "debug",
  })
);

// Kiểm tra server
app.get("/", (req, res) => {
  res.send("Proxy server is running...");
});

app.listen(8000, "0.0.0.0", () => {
  console.log("Proxy running at http://0.0.0.0:8000");
});
