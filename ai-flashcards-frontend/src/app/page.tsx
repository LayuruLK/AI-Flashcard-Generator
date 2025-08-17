import Image from "next/image";
import LoginPage from "./login/page";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <div>
      <LoginPage/>
    </div>
  );
}
