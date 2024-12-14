import { Router } from "express";
const myMiddleware = Router();

myMiddleware.use((req, res, next) => {
  const timestamp = new Date().toUTCString();
  const method = req.method;
  const route = req.originalUrl;
  const authenticated = req.session?.user ? true : false;
  const role = req.session?.user?.role || "None";

  console.log(`[${timestamp}]: ${method} ${route} (${authenticated ? `Authenticated ${role}` : "Non-Authenticated"})`);

  next();
});

myMiddleware.use("/signinuser", (req, res, next) => {
  if (req.session?.user) {
    const role = req.session.user.role;
    if (role === "admin") return res.redirect("/administrator");
    if (role === "user") return res.redirect("/user");
  }
  next();
});


export default myMiddleware;

