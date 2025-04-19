export const tableData = [
  'id SERIAL PRIMARY KEY',
  'shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE',
  'user_id INTEGER REFERENCES users(id) ON DELETE CASCADE',
  'joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'UNIQUE (shop_id, user_id)',
];

//! IMPORTANT: ASSUME FAKE DATA OF EXACTLY 100 ROWS
import { randNumber } from '@ngneat/falso';
export const fakerData: () => ShopQueueData = () => ({
  shop_id: Math.round(Math.random() * 100),
  user_id: Math.round(Math.random() * 100),
  joined_at: new Date(Date.now() - randNumber()),
});

const CREATE_QUERY =
  'INSERT INTO shop_queue (shop_id, user_id, joined_at) VALUES ($1, $2, $3) ON CONFLICT (shop_id, user_id) DO NOTHING;';
const ENQUEUE_QUERY =
  'INSERT INTO shop_queue (shop_id, user_id) VALUES ($1, $2) ON CONFLICT (shop_id, user_id) DO NOTHING;';
const DEQUEUE_QUERY =
  'DELETE FROM shop_queue WHERE shop_id=$1 ORDER BY joined_at LIMIT 1;';
const DELETE_QUERY = 'DELETE FROM shop_queue WHERE shop_id=$1;';
const DELETE_ITEM_QUERY =
  'DELETE FROM shop_queue WHERE shop_id=$1 AND user_id=$2;';
const GET_QUERY =
  'SELECT * FROM shop_queue WHERE shop_id=$1 ORDER BY joined_at;';

import { Pool } from 'pg';
import { DatabaseReturn, Result } from './result.js';

type ShopQueueEntry = {
  id: number;
  shop_id: number;
  user_id: number;
  joined_at: Date; // or Date, see below
};
type ShopQueueData = Omit<ShopQueueEntry, 'id'>;

function create(
  pool: Pool,
  { shop_id, user_id, joined_at }: ShopQueueData
): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: create', shop_id, user_id, joined_at);
    return await pool.query<ShopQueueEntry>(CREATE_QUERY, [
      shop_id,
      user_id,
      joined_at,
    ]);
  });
}

function enqueue(
  pool: Pool,
  shop_id: number,
  user_id: number
): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: enqueue', shop_id, user_id);
    return await pool.query<ShopQueueEntry>(ENQUEUE_QUERY, [shop_id, user_id]);
  });
}

function dequeue(pool: Pool, shop_id: number): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: dequeue', shop_id);
    return await pool.query<ShopQueueEntry>(DEQUEUE_QUERY, [shop_id]);
  });
}

function getQueue(pool: Pool, shop_id: number): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: getQueue', shop_id);
    return await pool.query<ShopQueueEntry>(GET_QUERY, [shop_id]);
  });
}

function deleteQueue(
  pool: Pool,
  shop_id: number
): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: deleteQueue', shop_id);
    return await pool.query<ShopQueueEntry>(DELETE_QUERY, [shop_id]);
  });
}

function deleteItemQueue(
  pool: Pool,
  shop_id: number,
  user_id: number
): DatabaseReturn<ShopQueueEntry> {
  return Result(async () => {
    console.log('queue: deleteItemQueue', shop_id, user_id);
    return await pool.query<ShopQueueEntry>(DELETE_ITEM_QUERY, [
      shop_id,
      user_id,
    ]);
  });
}

export function bundle(pool: Pool) {
  return {
    create: create.bind(null, pool),
    enqueue: enqueue.bind(null, pool),
    dequeue: dequeue.bind(null, pool),
    getQueue: getQueue.bind(null, pool),
    deleteItemQueue: deleteItemQueue.bind(null, pool),
    deleteQueue: deleteQueue.bind(null, pool),
  };
}
