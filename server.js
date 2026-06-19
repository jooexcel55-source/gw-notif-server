const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "yousef-a3438",
    clientEmail: "firebase-adminsdk-fbsvc@yousef-a3438.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: "https://yousef-a3438-default-rtdb.firebaseio.com"
});

const db = admin.database();

db.ref('cy_notifs').on('child_changed', async (snap) => {
  const uid = snap.key;
  const notifs = snap.val();
  if (!notifs) return;
  const userSnap = await db.ref('cy_users/' + uid).once('value');
  const user = userSnap.val();
  if (!user?.fcmToken) return;
  const unread = Object.values(notifs).filter(n => n.unread);
  if (!unread.length) return;
  const last = unread[unread.length - 1];
  await admin.messaging().send({
    token: user.fcmToken,
    notification: {
      title: '⚔️ Golden Warriors',
      body: last.text || 'إشعار جديد'
    },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } }
  });
});

app.get('/', (req, res) => res.send('GW Notif Server Running!'));
app.listen(3000, () => console.log('Server running on port 3000'));
