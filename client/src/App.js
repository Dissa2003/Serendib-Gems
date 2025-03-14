import AddUser from './adduser/AddUser';
import './App.css';
import User from './getuser/User';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Update from './updateuser/Update';
import Home from './pages/home'; // Import the Home component

function App() {
  const route = createBrowserRouter([
    {
      path: "/",
      element: <Home />,  // Set Home as the default route
    },
    {
      path: "/users",
      element: <User />, // You can move User to another route
    },
    {
      path: "/add",
      element: <AddUser />,
    },
    {
      path: "/update/:id",
      element: <Update />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={route} />
    </div>
  );
}

export default App;
