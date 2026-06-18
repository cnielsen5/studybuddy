import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { LibraryProvider } from "./lib/libraryContext";
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
            </Routes>
          </main>
        </BrowserRouter>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
