export function authenticate(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({
      code: 1001,
      message: "Unauthorized: Invalid API Key",
    });
  }
  next();

  console.log("Authentication successful");
}
