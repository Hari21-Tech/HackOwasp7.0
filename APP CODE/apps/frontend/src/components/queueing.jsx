import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const QueueingPage = () => {
  const { socket, connected } = useSocket();
  const [queueList, setQueueList] = useState([]);
  const [shopDetails, setShopDetails] = useState({
    totalCapacity: 0,
    currentOccupancy: 0,
    name: '',
    description: '',
  });
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '' });

  useEffect(() => {
    if (!socket) return;

    socket.on('get_shop_queue_result', (data) => {
      const ids = data.result.rows.map((row) => row.user_id);
      for (const id of ids) {
        socket.emit('get_user', id);
      }
    });
    socket.on('get_user_result', (data) => {
      const user = {
        id: data.result.rows[0].id,
        name: data.result.rows[0].username,
      };
      setQueueList((prevList) => [...prevList, user]);
    });
    socket.on('get_shop_result', (data) => {
      setShopDetails({
        totalCapacity: data.result.rows[0].total_occupancy,
        currentOccupancy: data.result.rows[0].current_occupancy,
        name: data.result.rows[0].name,
        description: data.result.rows[0].name,
      });
    })

    socket.emit('get_shop_queue', 1);
    socket.emit('get_shop', 1);

    return () => {
      socket.off('get_shop_queue');
      socket.off('get_user_result');
      socket.off('get_user');
      socket.off('get_shop');
    }
  }, []);

  const handleEditShopDetails = () => {
    console.log('Edit shop details');
  };

  const handleEditQueue = () => {
    console.log('Edit queue');
    setOpenModal(true);
  };

  const handleAddToQueue = () => {
    if (newUser.name) {
      const newId =
        queueList.length > 0 ? queueList[queueList.length - 1].id + 1 : 1;
      setQueueList([
        ...queueList,
        { id: newId, name: newUser.name },
      ]);
      setNewUser({ name: '' });
      setOpenModal(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const getQueueStats = () => {
    return {
      inStoreQueue: shopDetails.currentOccupancy,
      virtualQueue: queueList.length,
    };
  };

  const queueStats = getQueueStats();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Container className="max-w-7xl mx-auto">
        <Typography
          variant="h4"
          className="text-3xl font-bold mb-8 text-gray-800"
        >
          Queue Management
        </Typography>

        <Grid container spacing={6} className="mb-8">
          <Grid item xs={12} md={6}>
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <Typography
                  variant="h6"
                  className="text-xl font-semibold mb-4 text-gray-700"
                >
                  Shop Details
                </Typography>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Total Capacity:</span>{' '}
                    {shopDetails.totalCapacity}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {shopDetails.name}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{' '}
                    {shopDetails.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <Typography
                  variant="h6"
                  className="text-xl font-semibold mb-4 text-gray-700"
                >
                  Occupancy Details
                </Typography>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Current Occupancy:</span>{' '}
                    {shopDetails.currentOccupancy}
                  </p>
                  <p>
                    <span className="font-medium">Virtual Queue:</span>{' '}
                    {queueList.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper className="rounded-xl shadow-lg overflow-hidden mb-8">
          <Box className="p-6 bg-gray-50 flex justify-between items-center">
            <Typography
              variant="h6"
              className="text-xl font-semibold text-gray-700"
            >
              Virtual Queue
            </Typography>
            <Button
              variant="contained"
              onClick={handleEditQueue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Edit Queue
            </Button>
          </Box>
          <TableContainer>
            <Table className="min-w-full">
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold text-gray-700">
                    #
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Name
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queueList.map((person, index) => (
                  <TableRow key={person.id} className="hover:bg-gray-50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{person.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          className="rounded-xl"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add to Virtual Queue
          </DialogTitle>
          <DialogContent className="pt-6">
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="mb-4"
            />
          </DialogContent>
          <DialogActions className="px-6 py-4">
            <Button
              onClick={handleCloseModal}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddToQueue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default QueueingPage;
