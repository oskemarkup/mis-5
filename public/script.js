const registerForm = document.getElementById('registerForm');
const authForm = document.getElementById('authForm');


function formDataToObj(formData) {
  const object = {};

  formData.forEach(function(value, key) {
    object[key] = value;
  });

  return object;
}

function onRegister(event) {
  event.preventDefault();

  const { login } = formDataToObj(new FormData(event.target));
  const keys = nacl.sign.keyPair();
  const key = nacl.util.encodeBase64(keys.publicKey);
  const secret = nacl.util.encodeBase64(keys.secretKey);
  document.getElementById('secret').value = secret;
  document.getElementById('login2').value = login;
  console.log('Сохраняем локально:');
  console.log('Закрытый ключ', secret);
  console.log('Отправляем на сервер:');
  console.log('Логин', login);
  console.log('Открытый ключ', key);

  fetch('/register', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, key }),
  })
    .then(res => res.json())
    .then(res => console.log('Ответ сервера:', res))
    .catch(err => console.error(err));
}

function onAuth(event) {
  event.preventDefault();

  const { login, secret } = formDataToObj(new FormData(event.target));

  console.log('Запрашиваем одноразовое число у сервера');

  fetchRnd(login)
    .then(res => {
      console.log('Ответ сервера:', res);
      const rnd = Math.random().toString();
      console.log('Сгенерировали свое:', rnd);
      const message = nacl.util.decodeUTF8(res.rnd + rnd);
      const sign = nacl.util.encodeBase64(nacl.sign.detached(message, nacl.util.decodeBase64(secret)));
      console.log('Вычислили подпись:', sign);
      console.log('Отправляем на сервер:');
      console.log('Логин', login);
      console.log('Наше одноразовое число', rnd);
      console.log('Подпись', sign);

      return {login, rnd, sign};
    })
    .then(fetchResult)
    .then(res => {
      console.log('Ответ сервера:', res);
      if (res.result) {
        alert('Аутентификация прошла успешно!');
      } else {
        alert('Ошибка аутентификации!');
      }
    })
    .catch(err => console.error(err));
}

function fetchRnd(login) {
  return fetch('/rnd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login }),
  })
    .then(res => res.json())
}

function fetchResult({ login, rnd, sign }) {
  return fetch('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, rnd, sign }),
  })
    .then(res => res.json())
}


registerForm.addEventListener('submit', onRegister);
authForm.addEventListener('submit', onAuth);