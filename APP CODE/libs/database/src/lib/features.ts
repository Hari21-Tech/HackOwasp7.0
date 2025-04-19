export const tableData = [
  'id SERIAL PRIMARY KEY',
  'user_id INTEGER REFERENCES users(id) ON DELETE CASCADE',
  'feature_type INTEGER NOT NULL',
  'UNIQUE (user_id, feature_type)',
];

//! IMPORTANT: ASSUME FAKE DATA OF EXACTLY 100 ROWS
export const fakerData: () => FeatureData = () => ({
  user_id: Math.round(Math.random() * 100),
  feature_type: Math.round(Math.random() * 2),
});

const CREATE_QUERY =
  'INSERT INTO features (user_id, feature_type) VALUES ($1, $2)';
const GET_QUERY = 'SELECT * FROM features WHERE user_id=$1;';
const DELETE_QUERY = 'DELETE FROM features WHERE id=$1;';
const DELETE_ALL_QUERY = 'DELETE FROM features WHERE user_id=$1;';

import { Pool } from 'pg';
import { Result, DatabaseReturn } from './result.js';

export enum Features {
  QUEUE = 0,
  BACKTRACKING = 1,
  PARKING = 2,
}

type FeatureEntry = {
  id: number;
  user_id: number;
  feature_type: number | Features;
};
type FeatureData = Omit<FeatureEntry, 'id'>;

function getFeatures(
  pool: Pool,
  user_id: number
): DatabaseReturn<FeatureEntry> {
  return Result(async () => {
    console.log('feature: getFeatures', user_id);
    return await pool.query<FeatureEntry>(GET_QUERY, [user_id]);
  });
}

function addFeature(
  pool: Pool,
  { user_id, feature_type }: FeatureData
): DatabaseReturn<FeatureEntry> {
  return Result(async () => {
    console.log('feature: addFeature', user_id, feature_type);
    return await pool.query<FeatureEntry>(CREATE_QUERY, [
      user_id,
      feature_type,
    ]);
  });
}

function removeFeature(
  pool: Pool,
  feature_id: number
): DatabaseReturn<FeatureEntry> {
  return Result(async () => {
    console.log('feature: removeFeature', feature_id);
    return await pool.query<FeatureEntry>(DELETE_QUERY, [feature_id]);
  });
}

function removeAllOfUserFeatures(
  pool: Pool,
  user_id: number
): DatabaseReturn<FeatureEntry> {
  return Result(async () => {
    console.log('feature: removeAllOfUserFeatures', user_id);
    return await pool.query<FeatureEntry>(DELETE_ALL_QUERY, [user_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    getFeatures: getFeatures.bind(null, pool),
    addFeature: addFeature.bind(null, pool),
    removeFeature: removeFeature.bind(null, pool),
    removeAllOfUserFeatures: removeAllOfUserFeatures.bind(null, pool),
  };
}
