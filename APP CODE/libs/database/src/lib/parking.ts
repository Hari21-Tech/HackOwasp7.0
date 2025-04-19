export const tableData = [
  'id SERIAL PRIMARY KEY',
  'name TEXT NOT NULL',
  'number_of_empty_spots INTEGER NOT NULL',
  'maximum_number_of_spots INTEGER NOT NULL',
];

//! IMPORTANT: ASSUME FAKE DATA OF EXACTLY 100 ROWS
import { randCompanyName, randNumber } from '@ngneat/falso';
export const fakerData: () => ParkingData = () => ({
  name: randCompanyName(),
  number_of_empty_spots: randNumber({ max: 30 }),
  maximum_number_of_spots: randNumber({ min: 100, max: 200 }),
});

const CREATE_QUERY =
  'INSERT INTO parking (name, number_of_empty_spots, maximum_number_of_spots) VALUES ($1, $2, $3);';
const GET_QUERY = 'SELECT * FROM parking WHERE id=$1;';
const GET_ALL_QUERY = 'SELECT * FROM parking;';
const DELETE_QUERY = 'DELETE FROM parking WHERE id=$1;';
const UPDATE_QUERY = (
  name: string | null,
  number_of_empty_spots: number | null,
  maximum_number_of_spots: number | null
): { query: string; values: string[] } => {
  const query = [];
  const values = [];
  let paramIndex = 1;
  if (name !== null) {
    query.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (number_of_empty_spots !== null) {
    query.push(`number_of_empty_spots = $${paramIndex++}`);
    values.push(number_of_empty_spots.toString());
  }
  if (maximum_number_of_spots !== null) {
    query.push(`maximum_number_of_spots = $${paramIndex++}`);
    values.push(maximum_number_of_spots.toString());
  }
  return {
    query: `UPDATE parking SET ${query.join(', ')} WHERE id = $${paramIndex};`,
    values,
  };
};

import { Pool } from 'pg';
import { Result, DatabaseReturn, Nullable } from './result.js';

type ParkingEntry = {
  id: number;
  name: string;
  number_of_empty_spots: number;
  maximum_number_of_spots: number;
};
type ParkingData = Omit<ParkingEntry, 'id'>;

function createParking(
  pool: Pool,
  { name, number_of_empty_spots, maximum_number_of_spots }: ParkingData
): DatabaseReturn<ParkingEntry> {
  return Result(async () => {
    console.log(
      'parking: createParking',
      name,
      number_of_empty_spots,
      maximum_number_of_spots
    );
    return await pool.query<ParkingEntry>(CREATE_QUERY, [
      name,
      number_of_empty_spots,
      maximum_number_of_spots,
    ]);
  });
}

function getParking(
  pool: Pool,
  parking_id: string
): DatabaseReturn<ParkingEntry> {
  return Result(async () => {
    console.log('parking: getParking', parking_id);
    return await pool.query<ParkingEntry>(GET_QUERY, [parking_id]);
  });
}

function getAllParking(pool: Pool): DatabaseReturn<ParkingEntry> {
  return Result(async () => {
    return await pool.query<ParkingEntry>(GET_ALL_QUERY);
  });
}

function updateParking(
  pool: Pool,
  parking_id: number,
  {
    name,
    number_of_empty_spots,
    maximum_number_of_spots,
  }: Nullable<ParkingData>
): DatabaseReturn<ParkingEntry> {
  return Result(async () => {
    const { query, values } = UPDATE_QUERY(
      name,
      number_of_empty_spots,
      maximum_number_of_spots
    );
    console.log('parking: updateParking', query, values, parking_id);
    return await pool.query<ParkingEntry>(query, [...values, parking_id]);
  });
}

function deleteParking(
  pool: Pool,
  parking_id: string
): DatabaseReturn<ParkingEntry> {
  return Result(async () => {
    console.log('parking: deleteParking', parking_id);
    return await pool.query<ParkingEntry>(DELETE_QUERY, [parking_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    createParking: createParking.bind(null, pool),
    getParking: getParking.bind(null, pool),
    getAllParking: getAllParking.bind(null, pool),
    updateParking: updateParking.bind(null, pool),
    deleteParking: deleteParking.bind(null, pool),
  };
}
