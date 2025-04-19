import { Server } from 'socket.io';

type BackTrackingData = {
    object: string;
    last_holder: string;
    last_seen_time: string;
    last_camera: string;
}

export const setUpLiveUpdates = (io: Server, tag: string) => {
    io.on('connection', (socket) => {
        console.log(`A ${tag} user connected:`, socket.id);

        socket.on('disconnect', () => {
            console.log(`A ${tag} user disconnected:`, socket.id);
        });
    });
}

export const setupSocketEvents = (
    io: Server,
    frontend_io: Server,
    admin_io: Server
) => {
    io.on('connection', (socket) => {
        console.log('An ai connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('AI disconnected:', socket.id);
        });

        socket.on('queue_update', (data) => {
            console.log('Queue event received:', data);
            if (!data.status) {
                return;
            }
            frontend_io.emit('queue_update', data.people);
            admin_io.emit('queue_update', data.people);
        });

        socket.on('back_tracking', (data: BackTrackingData) => {
            console.log('Backtracking data: ', data);
        });

        socket.on('fire', () => {
            console.log('Fire event received');
            frontend_io.emit('fire');
            admin_io.emit('fire');
        });
    });
};