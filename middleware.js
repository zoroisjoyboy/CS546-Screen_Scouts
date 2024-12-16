export const logRequestAndRedirectRoot = (req, res, next) => {
  const timestamp = new Date().toUTCString();
  const method = req.method;
  const route = req.originalUrl;
  const isAuthenticated = req.session && req.session.user ? 'Authenticated' : 'Non-Authenticated';

  console.log(`[${timestamp}]: ${method} ${route} (${isAuthenticated})`);

  next();
};

export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      return res.redirect('/');
  }
  next();
};

export const checkAuthentication = (req, res, next) => {
  if (!req.session || !req.session.user) {
      return res.redirect('/signinuser');
  }
  next();
};

export const checkSignOut = (req, res, next) => {
  if (!req.session || !req.session.user) {
      return res.redirect('/signinuser');
  }
  next();
};
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

