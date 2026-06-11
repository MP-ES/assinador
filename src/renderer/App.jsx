import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import Config from './Config';

function App() {
  return (
    <ChakraProvider>
      <Config />
    </ChakraProvider>
  );
}

export default App;
