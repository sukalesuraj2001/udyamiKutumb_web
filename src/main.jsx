import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme-dark.generated.css'
import App from './App.jsx'
import ThemeProvider from './components/theme/ThemeProvider.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './components/redux/store.js'
import GlobalLoader from './components/common/GlobalLoader.jsx'
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Provider store={store}>
          <GlobalLoader />
          <App />
        </Provider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)