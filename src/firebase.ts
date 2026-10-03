import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, deleteDoc, collection, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { EvaDevice } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function saveDeviceToFirestore(userId: string, device: EvaDevice) {
  const path = `users/${userId}/devices/${device.device_id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'devices', device.device_id), {
      ...device,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadDevicesFromFirestore(userId: string): Promise<EvaDevice[]> {
  const path = `users/${userId}/devices`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'devices'));
    const devices: EvaDevice[] = [];
    querySnapshot.forEach((docSnap) => {
      devices.push(docSnap.data() as EvaDevice);
    });
    return devices;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteDeviceFromFirestore(userId: string, deviceId: string) {
  const path = `users/${userId}/devices/${deviceId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'devices', deviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
