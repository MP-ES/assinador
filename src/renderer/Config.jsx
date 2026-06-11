import React from 'react';
import {
  Badge,
  Box,
  Heading,
  Stack,
  Text,
  Flex,
  Button,
  NumberInput,
  NumberInputField
} from '@chakra-ui/react';
import { FaRecycle, FaPlus, FaBug } from 'react-icons/fa';

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
    window.electronAPI.getVersion().then(results => setVersao(results));
  }, []);
  React.useEffect(() => {
    window.electronAPI.getLibs().then(results => setLibs(results));
  }, []);
  React.useEffect(() => {
    window.electronAPI.getPort().then(results => setPort(results));
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
          <Badge colorScheme="green">{versao}</Badge>
        </Flex>
        <Heading as="h1">Assinador MPES</Heading>
        <Stack align="center" direction="row" my={2}>
          <Heading size="md">Endereço:</Heading>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              window.electronAPI.openExternal(
                `http://localhost:${port}/health`
              );
            }}
          >
            {`http://localhost:${port}`}
          </Button>
        </Stack>
        <Stack align="center" direction="row" my={2}>
          <Heading size="md">Porta:</Heading>
          <NumberInput
            min={19333}
            max={19335}
            onChange={(_, value) => setInputPort(value)}
            value={inputPort}
          >
            <NumberInputField />
          </NumberInput>
          <Button
            colorScheme="blue"
            isLoading={restarting}
            onClick={() => {
              setRestart(true);
              window.electronAPI
                .setPort(inputPort)
                .then(results => setPort(results))
                .finally(() => setRestart(false));
            }}
          >
            Alterar
          </Button>
        </Stack>
        <Stack direction="row" alignItems="center" my={2}>
          <Heading size="md">Modo teste:</Heading>
          <Button
            leftIcon={<FaBug />}
            variant="outline"
            size="sm"
            w="14rem"
            onClick={() => setOpenModal(true)}
          >
            Configurar
          </Button>
        </Stack>
        <Stack direction="row" alignItems="center" my={2}>
          <Heading size="md">Bibliotecas:</Heading>
          <Button
            leftIcon={<FaRecycle />}
            variant="outline"
            size="sm"
            w="14rem"
            isLoading={reloading}
            onClick={() => {
              setReload(true);
              window.electronAPI
                .reloadLibs()
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
            leftIcon={<FaPlus />}
            size="sm"
            colorScheme="green"
            mt={2}
            mr="auto"
            isLoading={adding}
            onClick={() => {
              setAdd(true);
              window.electronAPI
                .addLib()
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
