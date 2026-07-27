import { useRoutes } from "react-router-dom";
import AppRouter from "./components/router/AppRouter.jsx";

function App() {
  const router = useRoutes(AppRouter);
  return router;
}

export default App;