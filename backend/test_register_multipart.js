const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
  // Gera uma imagem PNG 1x1 (transparente)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const photoPath = path.join(__dirname, 'test_photo.png');
  fs.writeFileSync(photoPath, Buffer.from(pngBase64, 'base64'));

  const form = new FormData();
  form.append('token', ''); // will be filled after creating invite
  form.append('name', 'Teste Mobile');
  form.append('document', '00000000000');
  form.append('phone', '55989990000');
  form.append('password', 'senha123');
  form.append('photo', fs.createReadStream(photoPath));

  try {
    // 1) Cria invite para demo-condominium
    const inviteRes = await axios.post('http://localhost:3000/api/invites/request', {
      email: 'multipart+test@example.com',
      condominiumId: 'demo-condominium'
    });

    const iToken = inviteRes.data.iToken;
    console.log('iToken gerado:', iToken);

    // Atualiza token no form
    form.set('token', iToken);

    // 2) Envia multipart para registro
    const res = await axios.post('http://localhost:3000/api/residents/register-with-token', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Registro status:', res.status);
    console.log('Body:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Erro resposta:', err.response.status, err.response.data);
    } else {
      console.error('Erro:', err.message);
    }
  }
}

main();
