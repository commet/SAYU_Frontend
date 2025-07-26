const webpush = require('web-push');

// VAPID 키 생성
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 VAPID Keys Generated:');
console.log('');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📋 Add these to your .env file:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('📋 Add this to your frontend .env.local:');
console.log(`NEXT_PUBLIC_VAPID_KEY=${vapidKeys.publicKey}`);
console.log('');