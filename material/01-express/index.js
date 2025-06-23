const express = require('express');

const app = express();

app.get('/', function (req, res) {
  res.end('Homepage');
});

app.get('/contact-us', function (req, res) {
  res.end('You can contact me at my email address');
});

app.get('/tweets', (req, res) => {
  res.end('Here are your tweets');
});

app.post('/tweets', (req, res) => {
  res.status(201).end('Tweet Created Success');
});

app.listen(8000, () => console.log(`Server is running on PORT 8000`));
