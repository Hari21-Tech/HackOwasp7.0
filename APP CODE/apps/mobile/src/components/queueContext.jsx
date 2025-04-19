import React, { createContext, useContext, useState } from 'react';

const QueueContext = createContext();

export const useQueue = () => useContext(QueueContext);

export const QueueProvider = ({ children }) => {
  const [joinedShopId, setJoinedShopId] = useState(null);

  const joinShop = (shopId) => setJoinedShopId(shopId);
  const leaveShop = () => setJoinedShopId(null);

  return (
    <QueueContext.Provider value={{ joinedShopId, joinShop, leaveShop }}>
      {children}
    </QueueContext.Provider>
  );
};
