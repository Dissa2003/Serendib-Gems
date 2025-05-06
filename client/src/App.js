import AddUser from './adduser/AddUser';
import './App.css';
import User from './getuser/User';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Update from './updateuser/Update';
import Home from './pages/home';
import AddGem from './pages/addgem';
import Login from './pages/login';
import AboutUs from "./static/aboutus";
import ContactUs from './static/contactus';
import UserProfile from './pages/UserProfile';
import PrivacyPolicy from './static/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Dashboard from './Financial/Dashboard';
import AdminHome from "./Admin/AdminHome";
import GemInventory from './pages/geminventory';
import Chatbot from './pages/chatbot';
import ViewGemDetails from './pages/ViewGemDetails';
import Payment from './pages/payment';
import PaymentSuccess from './static/paymentsuccess';
import GemCategories from './pages/catogray';
import TrackYourDeliveryPage from './pages/TrackYourDeliveryPage';
import FinanceReport from './Financial/FinanceReport';
import GemCutting from './pages/gemcutting';
import GemDashboard from './gemadmin/gemdashboard';
import Adminpanel from './Admin/adminpanel';
import CuttingView from './cuttingadmin/CuttingView';
import ShippingDisplay from './shippingadmin/ShippingDisplay';
import AdminDashboard from './Admin/ADMIN';
import AdminGemCutting from './cuttingadmin/newreq';
import Welcome from './pages/welcome';
import AddGemByAdmin from './gemadmin/AddGemByAdmin';
import Cuttingscucess from './pages/cuttingsuccess';
import UserViewbyadmin from './adminfunction/AdminDashboard';
import AddStaff from './staff/addstaff';
import DisplayStaff from './staff/displaystaff';
import AdminLogin from './pages/admin';
import Admintable from './adminDashboard/AdminDashboard';

function App() {
  const route = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/profile",
      element: <UserProfile />,
    },
    {
      path: "/add-gem",
      element: <AddGem />,
    },
    {
      path: "/users",
      element: <User />,
    },
    {
      path: "/add",
      element: <AddUser />,
    },
    {
      path: "/update/:id",
      element: <Update />,
    },
    {
      path: "/aboutus",
      element: <AboutUs />,
    },
    {
      path: "/contact",
      element: <ContactUs />,
    },
    {
      path: "/privacy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/shippingpolicy",
      element: <ShippingPolicy />,
    },
    {
      path: "/findash",
      element: <Dashboard />,
    },
    {
      path: "/admin",
      element: <AdminHome />,
    },
    {
      path: "/geminven",
      element: <GemInventory />,
    },
    {
      path: "/chat",
      element: <Chatbot />,
    },
    {
      path: "/gem/:id",
      element: <ViewGemDetails />,
    },
    {
      path: "/payment",
      element: <Payment />,
    },
    {
      path: "/payment-success",
      element: <PaymentSuccess />,
    },
    {
      path: "/gemcat",
      element: <GemCategories />,
    },
    {
      path: "/track",
      element: <TrackYourDeliveryPage />,
    },
    {
      path: "/financereport",
      element: <FinanceReport />,
    },
    {
      path: "/gemcutting",
      element: <GemCutting />,
    },
    {
      path: "/gemdashboard",
      element: <GemDashboard />,
    },
    {
      path: "/dashboard",
      element: <Adminpanel />,
    },
    {
      path: "/cuttingview",
      element: <CuttingView />,
    },
    {
      path: "/shippingdisplay",
      element: <ShippingDisplay />,
    },
    {
      path: "/admindashboard",
      element: <AdminDashboard />,
    },
    {
      path: "/adminreq",
      element: <AdminGemCutting />,
    },
    {
      path: "/welcome",
      element: <Welcome />,
    },
    {
      path: "/adminhome",
      element: <AdminHome />, // Replaced UserAdminHome with AdminHome
    },
    {
      path: "/adminadd",
      element: <AddUser />, // Replaced UserAdminAdd with AddUser
    },
    {
      path: "/ert",
      element: <UserViewbyadmin />, // Replaced Users with UserViewbyadmin
    },
    {
      path: "/addgembyadmin",
      element: <AddGemByAdmin />,
    },
    {
      path: "/cutsuccess",
      element: <Cuttingscucess />,
    },
    {
      path: "/userdashboardadmin",
      element: <UserViewbyadmin />,
    },
    {
      path: "/addstaff",
      element: <AddStaff />,
    },
    {
      path: "/displaystaff",
      element: <DisplayStaff />,
    },
    {
      path: "/adminlogin",
      element: <AdminLogin />,
    },
    {
      path: "/admintable",
      element: <Admintable />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={route} />
    </div>
  );
}

export default App;