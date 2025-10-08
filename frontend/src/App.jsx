import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CourseProvider } from "./context/CourseContext";
import { UIProvider } from "./context/UIContext";
import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <UIProvider>
        <CourseProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course" element={<Dashboard />} />
          </Routes>
        </CourseProvider>
      </UIProvider>
    </Router>
  );
}

export default App;
