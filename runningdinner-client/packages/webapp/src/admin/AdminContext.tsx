import React, {useEffect, useState} from "react";
import {findRunningDinnerAsync, Parent, RunningDinner} from "@runningdinner/shared";
import {LinearProgress} from "@material-ui/core";

interface AdminContextData {
  runningDinner: RunningDinner;
  updateRunningDinner: (runningDinner: RunningDinner) => unknown;
}

export const AdminContext = React.createContext<AdminContextData | undefined>(undefined);

export interface AdminContextProviderProps extends Parent {
  adminId: string;
}

export const AdminContextProvider = ({children, adminId}: AdminContextProviderProps) => {

  const [runningDinner, setRunningDinner] = useState<RunningDinner>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  async function fetchRunningDinner(adminId: string) {
    setLoading(true);
    findRunningDinnerAsync(adminId)
      .then(data => {
          setRunningDinner(data);
          setError(undefined)
      }, errorResponse => {
        setError(errorResponse);
        setRunningDinner(undefined)
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRunningDinner(adminId);
    // eslint-disable-next-line
  }, [adminId]);


  if (error) {
    return <div>{error.message}</div>;
  }
  else if (loading) {
    return <LinearProgress color="secondary" />;
  }
  else {
    return (
      <AdminContext.Provider value={{
        // @ts-ignore
        runningDinner: runningDinner,
        updateRunningDinner: setRunningDinner
      }}>
        {children}
      </AdminContext.Provider>
    );
  }
};

export function useAdminContext(): AdminContextData {
  const context = React.useContext(AdminContext);
  if (context === undefined) {
    throw new Error(
        "useAdminContext must be used within an AdminContextProvider"
    );
  }
  return context;
}
