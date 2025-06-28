import { verifyPayment } from 'flutterwave-node-v3';
import { db } from './firebase';

export default async function handler(req, res) {
  const signature = req.headers['verif-hash'];
  if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body;
  const isValid = await verifyPayment({
    tx_ref: payload.tx_ref,
    secret_key: process.env.FLUTTERWAVE_SECRET_KEY
  });

  if (isValid.status === "success") {
    // Update user in Firebase
    const userRef = doc(db, 'users', payload.meta.user_id);
    await updateDoc(userRef, {
      paymentStatus: 'completed',
      tokensBought: payload.amount
    });
    
    return res.status(200).json({ status: 'success' });
  }
  
  return res.status(400).json({ error: 'Payment verification failed' });
}
