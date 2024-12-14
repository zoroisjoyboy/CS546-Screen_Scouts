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
