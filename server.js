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
  const tUid = snap.key;
  const notifs = snap.val();
  if (!notifs) return;
  const unread = Object.values(notifs).filter(n => n.unread);
  if (!unread.length) return;
  const last = unread[unread.length - 1];
  try {
    const userSnap = await db.ref('cy_users/' + tUid).once('value');
    const user = userSnap.val();
    if (!user?.fcmToken) return;
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: '⚔️ Golden Warriors',
        body: last.text || 'إشعار جديد'
      },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      webpush: {
        notification: {
          title: '⚔️ Golden Warriors',
          body: last.text || 'إشعار جديد',
          icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTPGbVU71SHCNSoeMKBiglfaaGJL5pHEidqhaI3EM6Hw&s=10'
        },
        fcmOptions: { link: 'https://jooexcel55-source.github.io/yousef-joo-55/' }
      }
    });
    console.log('✅ Notification sent to:', tUid);
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
});

db.ref('cy_notifs').on('child_added', async (snap) => {
  const tUid = snap.key;
  const notifs = snap.val();
  if (!notifs) return;
  const unread = Object.values(notifs).filter(n => n.unread);
  if (!unread.length) return;
  const last = unread[unread.length - 1];
  try {
    const userSnap = await db.ref('cy_users/' + tUid).once('value');
    const user = userSnap.val();
    if (!user?.fcmToken) return;
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: '⚔️ Golden Warriors',
        body: last.text || 'إشعار جديد'
      },
      webpush: {
        notification: {
          title: '⚔️ Golden Warriors',
          body: last.text || 'إشعار جديد',
          icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTPGbVU71SHCNSoeMKBiglfaaGJL5pHEidqhaI3EM6Hw&s=10'
        },
        fcmOptions: { link: 'https://jooexcel55-source.github.io/yousef-joo-55/' }
      }
    });
    console.log('✅ Notification sent to:', tUid);
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
});

app.get('/', (req, res) => res.send('✅ GW Notif Server Running!'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Server running!'));
