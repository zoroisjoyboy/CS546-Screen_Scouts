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
