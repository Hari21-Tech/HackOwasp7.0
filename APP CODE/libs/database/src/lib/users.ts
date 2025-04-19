export const tableData = [
  'id SERIAL PRIMARY KEY',
  'username TEXT NOT NULL',
  'password TEXT NOT NULL', // Hashing will be done after the hackathon
];

import { randUserName, randPassword } from '@ngneat/falso';
export const fakerData: () => UserData = () => ({
  username: randUserName(),
  password: randPassword() as unknown as string,
});

const CREATE_QUERY = 'INSERT INTO users (username, password) VALUES ($1, $2);';
const GET_QUERY = 'SELECT * FROM users WHERE id=$1;';
const DELETE_QUERY = 'DELETE FROM users WHERE id=$1;';
const UPDATE_QUERY = (
  username: string | null,
  password: string | null
): { query: string; values: string[] } => {
  const query = [];
  const values = [];
  let paramIndex = 1;
  if (username !== null) {
    query.push(`username = $${paramIndex++}`);
    values.push(username);
  }
  if (password !== null) {
    query.push(`password = $${paramIndex++}`);
    values.push(password);
  }
  return {
    query: `UPDATE users SET ${query.join(', ')} WHERE id = $${paramIndex};`,
    values,
  };
};

import { Pool } from 'pg';
import { Result, DatabaseReturn, Nullable } from './result.js';

type UserEntry = {
  id: number;
  username: string;
  password: string;
};
type UserData = Omit<UserEntry, 'id'>;

function createUser(
  pool: Pool,
  { username, password }: UserData
): DatabaseReturn<UserEntry> {
  return Result(async () => {
    console.log('user: createUser', username, password);
    return await pool.query<UserEntry>(CREATE_QUERY, [username, password]);
  });
}

function getUser(pool: Pool, user_id: string): DatabaseReturn<UserEntry> {
  return Result(async () => {
    console.log('user: getUser', user_id);
    return await pool.query<UserEntry>(GET_QUERY, [user_id]);
  });
}

function updateUser(
  pool: Pool,
  user_id: number,
  { username, password }: Nullable<UserData>
): DatabaseReturn<UserEntry> {
  return Result(async () => {
    const { query, values } = UPDATE_QUERY(username, password);
    console.log('user: updateUser', query, values, user_id);
    return await pool.query<UserEntry>(query, [...values, user_id]);
  });
}

function deleteUser(pool: Pool, user_id: string): DatabaseReturn<UserEntry> {
  return Result(async () => {
    console.log('user: deleteUser', user_id);
    return await pool.query<UserEntry>(DELETE_QUERY, [user_id]);
  });
}

export function bundle(pool: Pool) {
  return {
    createUser: createUser.bind(null, pool),
    getUser: getUser.bind(null, pool),
    updateUser: updateUser.bind(null, pool),
    deleteUser: deleteUser.bind(null, pool),
  };
}
