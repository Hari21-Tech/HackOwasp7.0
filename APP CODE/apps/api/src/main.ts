import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import fetch from 'node-fetch';

import { setupSocketEvents, setUpLiveUpdates } from './events';
import database, { ensureTables } from '@hackowasp/database';

ensureTables();

const app = express();
app.use(
  cors({
    origin: process.env.EXPO_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.options('*', cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const frontend_receiver_server = http.createServer(app);
const frontend_io = new Server(frontend_receiver_server);
setUpLiveUpdates(frontend_io, 'frontend');

const admin_receiver_server = http.createServer(app);
const admin_io = new Server(admin_receiver_server);
setUpLiveUpdates(admin_io, 'admin');

const server = http.createServer(app);
const io = new Server(server);
setupSocketEvents(io, frontend_io, admin_io);

frontend_io.on('connection', (socket) => {
  socket.on('get_shop', async (shop_id) => {
    const data = await database.shops.getShop(shop_id);
    if (!data.success) {
      return;
    }
    data.result.rows[0].image = 'https://picsum.photos/200/300';
      return socket.emit('get_shop_result', data);
    });
    socket.on('get_shop_queue', async (shop_id) => {
      const data = await database.shop_queue.getQueue(shop_id);
      if (!data.success) {
        return;
      }
      return socket.emit('get_shop_queue_result', data);
    });
    socket.on('get_parking', async (parking_id) => {
      const data = await database.parking_spot.getParkingSpots(parking_id);
      if (!data.success) {
        return;
      }
      return socket.emit('get_parking_result', data);
    });
    socket.on('get_parking_spots', async (parking_id) => {
      const data = await database.parking_spot.getParkingSpots(parking_id);
      if (!data.success) {
        return;
      }
      return socket.emit('get_parking_spots_result', data);
    });
    socket.on('get_user', async (user_id) => {
      const data = await database.users.getUser(user_id);
      if (!data.success) {
        return;
      }
      return socket.emit('get_user_result', data);
    });
    socket.on('start_back_tracking', (label) => {
      console.log('Starting backtracking for label:', label);
      io.emit('start_back_tracking', label);
    });
    socket.on('get_all_parking', async() => {
      const data = await database.parking.getAllParking();
      if (!data.success) {
        return;
      }
      return socket.emit('get_all_parking_result', data);
    })
});

frontend_receiver_server.listen(process.env.CLIENT_WS_PORT, () => {
  console.log(
    `Frontend update Server is running on port ${process.env.CLIENT_WS_PORT}`
  );
});

admin_receiver_server.listen(process.env.ADMIN_WS_PORT, () => {
  console.log(
    `Admin update Server is running on port ${process.env.ADMIN_WS_PORT}`
  );
});

server.listen(process.env.WS_PORT, () => {
  console.log(`Server is running on port ${process.env.WS_PORT}`);
});
