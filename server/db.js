// Persistent Relational MySQL Database Layer for GEC Palamu
// Powered by MySQL Server 9.4 (gec_palamu database)
import { mysqlDb } from './db_mysql.js';

export const db = mysqlDb;
export { mysqlDb, mysqlDb as sqlDb };
export default db;
