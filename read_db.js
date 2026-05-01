import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const snapshot = await getDocs(collection(db, 'rescues'));
  console.log('Total document count:', snapshot.size);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().status, doc.data().foodType);
  });
}
main().catch(console.error);
