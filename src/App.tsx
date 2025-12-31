import { Desktop } from './components/Desktop';
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}

export default App;
