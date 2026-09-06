async function test() {
  try {
    const res = await fetch('http://localhost:3000/c/moussa');
    console.log('STATUS CODE:', res.status);
    const text = await res.text();
    console.log('HTML SIZE:', text.length);
    if (res.status !== 200) {
      console.log('ERROR TEXT:', text.substring(0, 800));
    }
  } catch (err: any) {
    console.error('FETCH ERROR:', err.message);
  }
}
test();
