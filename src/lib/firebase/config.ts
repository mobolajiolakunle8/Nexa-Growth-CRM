export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyCcb_9wWEP975Y4wJi00GwdK1RK_-7tWDg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "nexa-growth-crm.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "nexa-growth-crm",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "nexa-growth-crm.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "588830145685",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:588830145685:web:0862f9c3acad165f452f9c",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-MFT1PBW8NF",
};

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
