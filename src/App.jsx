import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import AntigravityCore from './AntigravityCore';

function App() {
  return (
    <Authenticator
      loginMechanisms={['email']}
      className="amplify-auth-container min-h-screen bg-slate-950 flex items-center justify-center p-4"
    >
      {({ signOut, user }) => (
        <main 
          className="w-full h-full min-h-screen bg-[#070B14] selection:bg-orange-500 selection:text-white"
          data-author="AlennaArt-Code" 
          data-project-id="EasySupply-2026"
        >
          <AntigravityCore />
        </main>
      )}
    </Authenticator>
  );
}

export default App;
