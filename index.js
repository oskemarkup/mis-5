const express = require('express');
const bodyParser = require('body-parser');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const app = express();
const users = {};

app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.put('/register', (req, res) => {
  const { login, key } = req.body;
  console.log(req.body);
  users[login] = { key };
  res.send({ status: 'ok' });
});

app.post('/rnd', (req, res) => {
  const { login } = req.body;
  const rnd = Math.random().toString();
  users[login] = { ...users[login], rnd };
  res.send({ rnd });
});

app.post('/auth', (req, res) => {
  const { login, rnd, sign } = req.body;
  let result = false;

  if (users[login] && users[login].key && users[login].rnd) {
    const publicKey = nacl.util.decodeBase64(users[login].key);
    const message = nacl.util.decodeUTF8(users[login].rnd + rnd);
    result = nacl.sign.detached.verify(message, nacl.util.decodeBase64(sign), publicKey);
  }

  res.send({ result });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('app started');
});
