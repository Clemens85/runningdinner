import React, {useState} from "react";

export const AdminContext = React.createContext();

export const AdminContextProvider = ({children}) => {

  const [runningDinner, setRunningDinner] = useState({});

  return (
      <AdminContext.Provider value={{runningDinner, setRunningDinner }}>
        {children}
      </AdminContext.Provider>
  );
};
