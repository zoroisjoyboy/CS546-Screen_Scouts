// import express from 'express';
// import {addToWatchlist, getWatchlist} from './data/watchlist.js';
// import {ObjectId} from 'mongodb';
// import {dbConnection} from './config/mongoConnection.js';
// import configRoutesFunction from './routes/index.js';
// import handlebars from 'handlebars';
// import exphbs from 'express-handlebars';
// import session from 'express-session';
// import {create} from 'express-handlebars';
// //import myMiddleware from './middleware.js';
// // import myMiddleware from './middleware.js';

// const app = express();
// app.engine('handlebars', exphbs.engine({ defaultLayout: 'main'}));
// app.set('view engine', 'handlebars');
// app.set('views', './views');


// app.use(express.json());
// app.use(express.static('public'));
// app.use('/css', express.static('public/css')); // Serve CSS and nested files
// app.use('/js', express.static('public/js')); // Serve JavaScript
// app.use('/assets', express.static('public/assets'));


// app.use('/css', (req, res, next) => {
//   console.log(`Static CSS file requested: ${req.url}`);
//   next();
// });

// app.use('/js', (req, res, next) => {
//   console.log(`Static JS file requested: ${req.url}`);
//   next();
// });

// app.use(session({
//   name: 'AuthenticationState',
//   secret: 'some secret string!',
//   resave: false,
//   saveUninitialized: false,
// }));

// handlebars.registerHelper('eq', function(a, b) {
//   return a === b;
// });

// // app.use(myMiddleware);
// configRoutesFunction(app);

// app.listen(3000, () => {
//     console.log("We've now got a server!");
//     console.log('Your routes will be running on http://localhost:3000');
// });

import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
import handlebars from 'handlebars';
import configRoutesFunction from './routes/index.js';

const app = express();

handlebars.registerHelper('eq', function(a, b) {
     return a === b;
});

app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use('/assets', express.static('public/assets'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false,
}));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
