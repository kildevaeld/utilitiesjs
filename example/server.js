

const app = require('express')();

//app.set('view engine', 'jade');

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/text', (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000);