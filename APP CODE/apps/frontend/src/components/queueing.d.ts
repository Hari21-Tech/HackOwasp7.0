import { ReactElement } from 'react';

interface QueueUser {
  id: number;
  name: string;
  phone: string;
}

interface ShopDetails {
  totalCapacity: number;
  currentOccupancy: number;
  name: string;
  address: string;
}

declare const QueueingPage: () => ReactElement;

export default QueueingPage;
