import React from 'react';
import {
  Badge,
  Box,
  Heading,
  Stack,
  Text,
  Flex,
  Button,
  NumberInput
} from '@chakra-ui/core';
import { FaRecycle, FaPlus, FaBug } from 'react-icons/fa';
import { ipcRenderer, shell } from 'electron';

import Token from './components/Token';
import DevMode from './components/DevMode';

export default function Config() {
  const [versao, setVersao] = React.useState('');
  const [libs, setLibs] = React.useState([]);
  const [port, setPort] = React.useState('19333');
  const [inputPort, setInputPort] = React.useState(port);
  const [restarting, setRestart] = React.useState(false);
  const [reloading, setReload] = React.useState(false);
  const [adding, setAdd] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  React.useEffect(() => {
    ipcRenderer.invoke('get-version').then(results => setVersao(results));
  }, []);
  React.useEffect(() => {
    ipcRenderer.invoke('get-libs').then(results => setLibs(results));
  }, []);
  React.useEffect(() => {
    ipcRenderer.invoke('get-port').then(results => setPort(results));
  }, []);

  return (
    <>
      <Box p={2}>
        <Flex
          direction="row"
          align="center"
          position="absolute"
          top={2}
          right={2}
        >
          <Text mr={1}>versão</Text>
          <Badge variantColor="green">{versao}</Badge>
        </Flex>
        <Heading as="h1">Assinador MPES</Heading>
        <Stack align="center" isInline my={2}>
          <Heading size="md">Endereço:</Heading>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              event.preventDefault();
              shell.openExternal(`http://localhost:${port}/health`);
            }}
          >
            {`http://localhost:${port}`}
          </Button>
        </Stack>
        <Stack align="center" isInline my={2}>
          <Heading size="md">Porta:</Heading>
          <NumberInput
            min={19333}
            max={19335}
            onChange={value => setInputPort(value)}
            value={inputPort}
          />
          <Button
            variantColor="blue"
            isLoading={restarting}
            onClick={() => {
              setRestart(true);
              ipcRenderer
                .invoke('set-port', inputPort)
                .then(results => setPort(results))
                .finally(() => setRestart(false));
            }}
          >
            Alterar
          </Button>
        </Stack>
        <Stack isInline alignItems="center" my={2}>
          <Heading size="md">Modo teste:</Heading>
          <Button
            leftIcon={FaBug}
            variantColor="white"
            variant="outline"
            size="sm"
            w="14rem"
            onClick={() => setOpenModal(true)}
          >
            Configurar
          </Button>
        </Stack>
        <Stack isInline alignItems="center" my={2}>
          <Heading size="md">Bibliotecas:</Heading>
          <Button
            leftIcon={FaRecycle}
            variantColor="white"
            variant="outline"
            size="sm"
            w="14rem"
            isLoading={reloading}
            onClick={() => {
              setReload(true);
              ipcRenderer
                .invoke('reload-libs')
                .then(results => setLibs(results))
                .finally(() => setReload(false));
            }}
          >
            Recarregar valores padrão
          </Button>
        </Stack>
        <Stack spacing={2}>
          {libs.map(lib => (
            <Token key={lib} library={lib} setLibs={setLibs} />
          ))}
          <Button
            leftIcon={FaPlus}
            size="sm"
            variantColor="green"
            mt={2}
            mr="auto"
            isLoading={adding}
            onClick={() => {
              setAdd(true);
              ipcRenderer
                .invoke('add-lib')
                .then(results => setLibs(results))
                .finally(() => setAdd(false));
            }}
          >
            Incluir Biblioteca
          </Button>
        </Stack>
      </Box>

      <DevMode isOpen={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
