export const tableData = [
  'id SERIAL PRIMARY KEY',
  'parking_id INTEGER REFERENCES parking(id) ON DELETE CASCADE',
  'floor TEXT NOT NULL',
  'spot TEXT NOT NULL',
  'UNIQUE (parking_id, floor, spot)',
];

//! IMPORTANT: ASSUME FAKE DATA OF EXACTLY 100 ROWS
const alphaChars = 'qwertyuioplkjhgfdsazxcvbnm';
export const fakerData: () => ParkingSpotData = () => ({
  parking_id: Math.round(Math.random() * 100),
  floor: Math.round(Math.random() * 4).toString(),
  spot:
    alphaChars[Math.round(Math.random() * 26)].toUpperCase() +
    Math.round(Math.random() * 69).toString(),
});

const CREATE_QUERY =
  'INSERT INTO parking_spot (parking_id, floor, spot) VALUES ($1, $2, $3) ON CONFLICT (parking_id, position_label) DO NOTHING;';
const GET_QUERY = 'SELECT * FROM parking_spot WHERE parking_id=$1;';
const GET_ALL_QUERY = 'SELECT * FROM parking_spot;';
const DELETE_QUERY = 'DELETE FROM parking_spot WHERE id=$1;';
const DELETE_ALL_QUERY = 'DELETE FROM parking_spot WHERE parking_id=$1;';

import { Pool } from 'pg';
import { Result, DatabaseReturn } from './result.js';

type ParkingSpotEntry = {
  id: number;
  parking_id: number;
  floor: string;
  spot: string;
};
type ParkingSpotData = Omit<ParkingSpotEntry, 'id'>;

function getParkingSpots(
  pool: Pool,
  parking_id: number
): DatabaseReturn<ParkingSpotEntry> {
  return Result(async () => {
    console.log('parking_spot: getParkingSpots', parking_id);
    return await pool.query<ParkingSpotEntry>(GET_QUERY, [parking_id]);
  });
}

function getAllParkingSpots(
  pool: Pool,
): DatabaseReturn<ParkingSpotEntry> {
  return Result(async () => {
    console.log('parking_spot: getAllParkingSpots');
    return await pool.query<ParkingSpotEntry>(GET_ALL_QUERY);
  });
}


function addParkingSpot(
  pool: Pool,
  { parking_id, floor, spot }: ParkingSpotData
): DatabaseReturn<ParkingSpotEntry> {
  return Result(async () => {
    console.log('parking_spot: addParkingSpot', parking_id, floor, spot);
    return await pool.query<ParkingSpotEntry>(CREATE_QUERY, [
      parking_id,
      floor,
      spot,
    ]);
  });
}

function removeParkingSpot(
  pool: Pool,
  parking_spot_id: number
): DatabaseReturn<ParkingSpotEntry> {
  return Result(async () => {
    console.log('parking_spot: removeParkingSpot', parking_spot_id);
    return await pool.query<ParkingSpotEntry>(DELETE_QUERY, [parking_spot_id]);
  });
}

function removeAllOfParkingArea(
  pool: Pool,
  parking_id: number
): DatabaseReturn<ParkingSpotEntry> {
  return Result(async () => {
    console.log('parking_spot: removeAllOfParkingArea', parking_id);
    return await pool.query<ParkingSpotEntry>(DELETE_ALL_QUERY, [parking_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    getParkingSpots: getParkingSpots.bind(null, pool),
    getAllParkingSpots: getAllParkingSpots.bind(null, pool),
    addParkingSpot: addParkingSpot.bind(null, pool),
    removeParkingSpot: removeParkingSpot.bind(null, pool),
    removeAllOfParkingArea: removeAllOfParkingArea.bind(null, pool),
  };
}
