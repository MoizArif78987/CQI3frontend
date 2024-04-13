import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [darkmode, setDarkmode] = useState(false);


  return (
    <AdminContext.Provider value={{ adminName, setAdminName, adminEmail, setAdminEmail, darkmode,setDarkmode }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  return useContext(AdminContext);
};
