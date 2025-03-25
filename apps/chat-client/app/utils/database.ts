import { drizzle, OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { open, IOS_LIBRARY_PATH, ANDROID_DATABASE_PATH } from '@op-engineering/op-sqlite';
import * as schema from '../../drizzle/schema';
import x from 'drizzle/migrations'
import Crypto from 'react-native-quick-crypto';

import { Platform } from "react-native";

let db: OPSQLiteDatabase<typeof schema>;

export const Init = async (name: string) => {
    
    const key = Crypto.createHash('sha256').update(name).digest().toString('hex');
    console.log('db init',key);
    const sqlite = open({
        name: name + '.sqlite' ,
        location: Platform.OS === 'ios' ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH,
        encryptionKey: key
    });
    db = drizzle(sqlite, { schema });
    console.log('db migrate');
    return new Promise<void>(async (resolve, reject) => migrate(db, x).then(() => resolve()).catch((error) => reject(error)));
}

export const GetDB = () => {
    if(db){
        return db;
    }
    throw new Error('db not init');
};