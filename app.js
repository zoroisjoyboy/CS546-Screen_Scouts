import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
//import myMiddleware from './middleware.js';

const app = express();
import configRoutesFunction from './routes/index.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  saveUninitialized: false,
  resave: false
})
);


app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });

  

