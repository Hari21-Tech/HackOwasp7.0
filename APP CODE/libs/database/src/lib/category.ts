export const tableData = [
  'id SERIAL PRIMARY KEY',
  'shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE',
  'category_type INTEGER NOT NULL',
  'UNIQUE (shop_id, category_type)',
];

//! IMPORTANT: ASSUME FAKE DATA OF EXACTLY 100 ROWS
export const fakerData: () => CategoryData = () => ({
  shop_id: Math.round(Math.random() * 100),
  category_type: Math.round(Math.random() * 2),
});

const CREATE_QUERY =
  'INSERT INTO category (shop_id, category_type) VALUES ($1, $2)';
const GET_QUERY = 'SELECT * FROM category WHERE shop_id=$1;';
const DELETE_QUERY = 'DELETE FROM category WHERE id=$1;';
const DELETE_ALL_QUERY = 'DELETE FROM category WHERE shop_id=$1;';

import { Pool } from 'pg';
import { Result, DatabaseReturn } from './result.js';

export enum Categories {
  FOOD = 0,
  FASHION = 1,
  ELECTRONICS = 2,
}

type CategoryEntry = {
  id: number;
  shop_id: number;
  category_type: number | Categories;
};
type CategoryData = Omit<CategoryEntry, 'id'>;

function getCategories(
  pool: Pool,
  shop_id: number
): DatabaseReturn<CategoryEntry> {
  return Result(async () => {
    console.log('category: getCategories', shop_id);
    return await pool.query<CategoryEntry>(GET_QUERY, [shop_id]);
  });
}

function addCategory(
  pool: Pool,
  { shop_id, category_type }: CategoryData
): DatabaseReturn<CategoryEntry> {
  return Result(async () => {
    console.log('category: addCategory', shop_id, category_type);
    return await pool.query<CategoryEntry>(CREATE_QUERY, [
      shop_id,
      category_type,
    ]);
  });
}

function removeCategory(
  pool: Pool,
  category_id: number
): DatabaseReturn<CategoryEntry> {
  return Result(async () => {
    console.log('category: removeCategory', category_id);
    return await pool.query<CategoryEntry>(DELETE_QUERY, [category_id]);
  });
}

function removeAllOfUserCategorys(
  pool: Pool,
  shop_id: number
): DatabaseReturn<CategoryEntry> {
  return Result(async () => {
    console.log('category: removeAllOfUserCategorys', shop_id);
    return await pool.query<CategoryEntry>(DELETE_ALL_QUERY, [shop_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    getCategories: getCategories.bind(null, pool),
    addCategory: addCategory.bind(null, pool),
    removeCategory: removeCategory.bind(null, pool),
    removeAllOfUserCategorys: removeAllOfUserCategorys.bind(null, pool),
  };
}
