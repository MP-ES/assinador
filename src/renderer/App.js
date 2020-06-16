import React from 'react';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';

import Config from './Config';

function App() {
  return (
    <ThemeProvider>
      <CSSReset />
      <Config />
    </ThemeProvider>
  );
}

export default App;
