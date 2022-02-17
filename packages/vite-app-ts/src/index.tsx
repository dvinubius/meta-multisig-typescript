/* eslint-disable */
//import './helpers/__global';
import { MoralisProvider } from 'react-moralis';
import { APP_ID, SERVER_URL } from '~~/config/appConfig';

const run = async (): Promise<void> => {
  await import('./helpers/__global');
  // dynamic imports for code splitting
  const { lazy, Suspense, StrictMode } = await import('react');
  const ReactDOM = await import('react-dom');

  const App = lazy(() => import('./App'));

  const WrappedApp = () => {
    const isServerInfo = !!APP_ID && !!SERVER_URL;
    //Validate
    if (!APP_ID || !SERVER_URL)
      throw new Error('Missing Moralis Application ID or Server URL. Make sure to set your .env file.');
    if (isServerInfo)
      return (
        <MoralisProvider initializeOnMount={true} appId={APP_ID} serverUrl={SERVER_URL}>
          <App />
        </MoralisProvider>
      );
    else {
      return <div style={{ display: 'flex', justifyContent: 'center' }}>SERVER INFO MISSING</div>;
    }
  };

  ReactDOM.render(
    <StrictMode>
      <Suspense fallback={<div />}>
        <WrappedApp />
      </Suspense>
    </StrictMode>,
    document.getElementById('root')
  );
};

void run();

export {};
