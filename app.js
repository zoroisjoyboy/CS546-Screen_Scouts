import express from 'express';
import path from 'path';


const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/', mainPageRoutes);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });

