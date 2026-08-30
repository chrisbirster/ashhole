import { render } from '@solidjs/web';
import App from './app/App';
import './styles/global.css';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root element');

render(() => <App />, root);
