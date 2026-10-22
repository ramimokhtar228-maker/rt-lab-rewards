import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ensureOfficialLabDataSynchronized } from './utils/storage';

// Guarantee laboratory data integrity and purge stale cache before mounting
ensureOfficialLabDataSynchronized();

createRoot(document.getElementById('root')!).render(<App />);
