import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { LibraryProvider } from "./lib/libraryContext";
import { CertificationPage } from "./pages/CertificationPage";
import { CreateLibraryPage } from "./pages/CreateLibraryPage";
import { ConceptMapPage } from "./pages/ConceptMapPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { StudyPage } from "./pages/StudyPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <BrowserRouter>
          <main className="app-shell">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/study" element={<StudyPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/concept-map" element={<ConceptMapPage />} />
              <Route path="/certify" element={<CertificationPage />} />
              <Route path="/create-library" element={<CreateLibraryPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
