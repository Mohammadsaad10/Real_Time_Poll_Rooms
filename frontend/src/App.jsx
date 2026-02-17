import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router";
import CreatePoll from "./pages/CreatePoll.jsx";
import PollPage from "./pages/PollPage.jsx";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/polls/:id" element={<PollPage />} />
      </Routes>
      <ToastContainer position="top-right" />
    </>
  );
};

export default App;
