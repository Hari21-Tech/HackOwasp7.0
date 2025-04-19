import { Pool, types } from 'pg';
import {
  bundle as queueBundle,
  tableData as queueTableData,
  fakerData as queueFakerData,
} from './lib/queue.js';
import {
  bundle as shopBundle,
  tableData as shopTableData,
  fakerData as shopFakerData,
} from './lib/shops.js';
import {
  bundle as userBundle,
  tableData as userTableData,
  fakerData as userFakerData,
} from './lib/users.js';
import {
  bundle as parkingBundle,
  tableData as parkingTableData,
  fakerData as parkingFakerData,
} from './lib/parking.js';
import {
  bundle as parkingSpotBundle,
  tableData as parkingSpotTableData,
  fakerData as parkingSpotFakerData,
} from './lib/parking_spot.js';
import {
  bundle as featureBundle,
  tableData as featureTableData,
  fakerData as featureFakerData,
} from './lib/features.js';

types.setTypeParser(1114, (str: string) => new Date(str));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: Number(process.env.DB_PORT ?? 5432),
});

type TableName =
  | 'features'
  | 'parking_spot'
  | 'parking'
  | 'shop_queue'
  | 'shops'
  | 'users';
const tables = {
  users: userTableData,
  features: featureTableData,
  parking: parkingTableData,
  parking_spot: parkingSpotTableData,
  shops: shopTableData,
  shop_queue: queueTableData,
};
const bundles = {
  features: featureBundle(pool),
  parking_spot: parkingSpotBundle(pool),
  parking: parkingBundle(pool),
  shop_queue: queueBundle(pool),
  shops: shopBundle(pool),
  users: userBundle(pool),
};
export default bundles;
const fakeInserter = {
  users: () => bundles.users.createUser(userFakerData()),
  features: () => bundles.features.addFeature(featureFakerData()),
  parking: () => bundles.parking.createParking(parkingFakerData()),
  parking_spot: () =>
    bundles.parking_spot.addParkingSpot(parkingSpotFakerData()),
  shops: () => bundles.shops.createShop(shopFakerData()),
  shop_queue: () => bundles.shop_queue.create(queueFakerData()),
};

async function tableExists(tableName: string): Promise<boolean> {
  const checkQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  const res = await pool.query(checkQuery, [tableName]);
  return res.rows[0].exists;
}

async function ensureTable(table_name: TableName, data: string[]) {
  const already_exists = await tableExists(table_name);
  if (already_exists) {
    console.log(`"${table_name}" already exists`);
    return;
  }

  await pool.query(`CREATE TABLE ${table_name} (${data.join(', ')});`);
  for (let _ = 0; _ < 100; _++) {
    try {
      await fakeInserter[table_name]();
    } catch {
      // fuck it
    }
  }
  console.log(`"${table_name}" created`);
}

export async function ensureTables() {
  try {
    for (const table_name of Object.keys(tables)) {
      await ensureTable(
        table_name as TableName,
        tables[table_name as TableName]
      );
    }
  } catch (err) {
    throw new Error(`Error ensuring database tables\n${err}`);
  }
}
