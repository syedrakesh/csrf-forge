import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ParserPage } from './pages/ParserPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="parser" element={<ParserPage />} />
        <Route path="analyzer" element={<AnalyzerPage />} />
        <Route path="generator" element={<GeneratorPage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
