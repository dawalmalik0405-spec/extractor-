import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import UploadPage from "./pages/UploadPage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentPage from "./pages/DocumentPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={<UploadPage />}
          />

          <Route
            path="/documents"
            element={<DocumentsPage />}
          />

          <Route
            path="/documents/:id"
            element={<DocumentPage />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
