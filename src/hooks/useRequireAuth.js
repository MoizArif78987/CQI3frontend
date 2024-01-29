import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useRequireAuth = (authenticated) => {
  const history = useHistory();

  useEffect(() => {
    if (!authenticated) {
      history.push('/');
    }
  }, [authenticated, history]);
};

export default useRequireAuth;
