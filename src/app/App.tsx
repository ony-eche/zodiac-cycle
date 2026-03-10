import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserDataProvider } from './context/UserDataContext';

export default function App() {
  return (
    <UserDataProvider>
      <RouterProvider router={router} />
    </UserDataProvider>
  );
}
