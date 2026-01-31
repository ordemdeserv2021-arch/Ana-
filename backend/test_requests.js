(async () => {
  const base = 'http://localhost:3000';
  try {
    console.log('POST /api/invites/request');
    const res = await fetch(`${base}/api/invites/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste+mobile@example.com', condominiumId: 'demo-condominium' })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(data, null, 2));

    if (data && data.iToken) {
      console.log('\nGET /api/invites/verify/' + data.iToken);
      const res2 = await fetch(`${base}/api/invites/verify/${data.iToken}`);
      const d2 = await res2.json();
      console.log('Status:', res2.status);
      console.log('Body:', JSON.stringify(d2, null, 2));
    }
  } catch (err) {
    console.error('Erro nas requisições:', err.message);
    process.exit(1);
  }
})();
