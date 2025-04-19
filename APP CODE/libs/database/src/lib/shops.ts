export const tableData = [
  'id SERIAL PRIMARY KEY',
  'name TEXT NOT NULL',
  'description TEXT NOT NULL',
  'position POINT NOT NULL',
  'image TEXT NOT NULL',
  'current_occupancy INTEGER NOT NULL',
  'total_occupancy INTEGER NOT NULL',
];

import {
  randUserName,
  randLatitude,
  randLongitude,
  randProductDescription,
  randNumber,
  randImg,
} from '@ngneat/falso';
export const fakerData: () => ShopData = () => ({
  name: randUserName(),
  description: randProductDescription(),
  position: {
    latitude: randLatitude(),
    longitude: randLongitude(),
  },
  image: randImg(),
  current_occupancy: randNumber({ max: 10 }),
  total_occupancy: randNumber({ min: 15, max: 30 }),
});

const CREATE_QUERY =
  'INSERT INTO shops (name, description, position, image, current_occupancy, total_occupancy) VALUES ($1, $2, point($3, $4), $5, $6, $7);';
const GET_QUERY = 'SELECT * FROM shops WHERE id=$1;';
const DELETE_QUERY = 'DELETE FROM shops WHERE id=$1;';
const UPDATE_QUERY = ({
  name,
  description,
  position,
  image,
  current_occupancy,
  total_occupancy,
}: Nullable<ShopData>): { query: string; values: string[] } => {
  const query = [];
  const values = [];
  let paramIndex = 1;
  if (name !== null) {
    query.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== null) {
    query.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (position !== null) {
    query.push(`position = point($${paramIndex++}, $${paramIndex++})`);
    values.push(position.latitude.toString());
    values.push(position.longitude.toString());
  }
  if (image !== null) {
    query.push(`image = $${paramIndex++}`);
    values.push(image);
  }
  if (current_occupancy !== null) {
    query.push(`current_occupancy = $${paramIndex++}`);
    values.push(current_occupancy.toString());
  }
  if (total_occupancy !== null) {
    query.push(`total_occupancy = $${paramIndex++}`);
    values.push(total_occupancy.toString());
  }
  return {
    query: `UPDATE shops SET ${query.join(', ')} WHERE id = $${paramIndex};`,
    values,
  };
};

import { Pool } from 'pg';
import { Result, DatabaseReturn, Nullable } from './result.js';

type ShopEntry = {
  id: number;
  name: string;
  description: string;
  position: {
    latitude: number;
    longitude: number;
  };
  image: string;
  current_occupancy: number;
  total_occupancy: number;
};
type ShopData = Omit<ShopEntry, 'id'>;

function createShop(
  pool: Pool,
  {
    name,
    description,
    position: { latitude, longitude },
    image,
    current_occupancy,
    total_occupancy,
  }: ShopData
): DatabaseReturn<ShopEntry> {
  return Result(async () => {
    return await pool.query<ShopEntry>(CREATE_QUERY, [
      name,
      description,
      latitude,
      longitude,
      image,
      current_occupancy,
      total_occupancy,
    ]);
  });
}

function getShop(pool: Pool, shop_id: string): DatabaseReturn<ShopEntry> {
  return Result(async () => {
    console.log('shop: getShop', shop_id);
    return await pool.query<ShopEntry>(GET_QUERY, [shop_id]);
  });
}

function updateShop(
  pool: Pool,
  shop_id: number,
  updates: Nullable<ShopData>
): DatabaseReturn<ShopEntry> {
  return Result(async () => {
    console.log('shop: updateShop', shop_id, updates);
    const { query, values } = UPDATE_QUERY(updates);
    return await pool.query<ShopEntry>(query, [...values, shop_id]);
  });
}

function deleteShop(pool: Pool, shop_id: string): DatabaseReturn<ShopEntry> {
  return Result(async () => {
    console.log('shop: deleteShop', shop_id);
    return await pool.query<ShopEntry>(DELETE_QUERY, [shop_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    createShop: createShop.bind(null, pool),
    getShop: getShop.bind(null, pool),
    updateShop: updateShop.bind(null, pool),
    deleteShop: deleteShop.bind(null, pool),
  };
}
