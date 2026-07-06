// App.jsx — replace your existing file with this
// The Sandbox logic has moved into Sandbox.jsx for cleanliness

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import KarooLandingPage from "./KarooLandingPage";
import ChallengePage from "./ChallengePage";
import Sandbox from "./Sandbox";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={<KarooLandingPage onExploreCourses={() => navigate("/challenges")} />}
      />
      <Route
        path="/challenges"
        element={
          <ChallengePage
            onStartChallenge={(id) => navigate(`/sandbox?challenge=${id}`)}
            onBack={() => navigate("/")}
          />
        }
      />
      <Route
        path="/sandbox"
        element={<Sandbox key={location.search} />}
      />
    </Routes>
  );
}
