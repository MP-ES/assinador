import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Heading,
  Stack,
  Text,
  IconButton,
  Flex,
  Button,
  Input,
  NumberInput
} from '@chakra-ui/core';
import { MdSettings } from 'react-icons/md';
import { FaTrash, FaRecycle, FaPlus, FaList } from 'react-icons/fa';
import { ipcRenderer, shell } from 'electron';
import Certs from './Certs';

export default function Config() {
  const [versao, setVersao] = useState('');
  const [libs, setLibs] = useState([]);
  const [port, setPort] = useState('19333');
  const [inputPort, setInputPort] = useState(port);
  const [libValue, setLibValue] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalLib, setModalLib] = useState('');
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke('get-version').then(results => setVersao(results));
  }, []);
  useEffect(() => {
    ipcRenderer.invoke('get-libs').then(results => setLibs(results));
  }, []);
  useEffect(() => {
    ipcRenderer.invoke('get-port').then(results => setPort(results));
  }, []);

  return (
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
          color="blue.500"
          onClick={() => {
            ipcRenderer
              .invoke('set-port', inputPort)
              .then(results => setPort(results));
          }}
        >
          Alterar
        </Button>
      </Stack>
      <Stack isInline my={2}>
        <Heading size="md">Bibliotecas:</Heading>
        <Button
          leftIcon={FaRecycle}
          variant="outline"
          size="sm"
          ml="auto"
          onClick={() => {
            ipcRenderer.invoke('reload-libs').then(results => setLibs(results));
          }}
        >
          Recarregar valores padrão
        </Button>
      </Stack>
      <Stack spacing={2}>
        {libs.map(lib => (
          <Stack
            isInline
            align="center"
            shadow="md"
            p={2}
            borderWidth="1px"
            key={lib}
          >
            <Box as={MdSettings} color="green.500" fontSize={32} />
            <Text isTruncated>{lib}</Text>
            <IconButton
              icon={FaList}
              variant="ghost"
              color="green.500"
              ml="auto"
              onClick={() =>
                ipcRenderer.invoke('get-certificates', lib).then(results => {
                  setCerts(results);
                  setModalLib(lib);
                  setOpenModal(true);
                })
              }
            />
            <IconButton
              icon={FaTrash}
              variant="ghost"
              color="red.500"
              onClick={() => {
                ipcRenderer
                  .invoke('remove-lib', lib)
                  .then(results => setLibs(results));
              }}
            />
          </Stack>
        ))}
        <Certs
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          lib={modalLib}
          certs={certs}
        />
        <Stack isInline align="center" p={2}>
          <Input
            value={libValue}
            onChange={event => setLibValue(event.target.value)}
          />
          <IconButton
            icon={FaPlus}
            variant="solid"
            color="blue.500"
            ml="auto"
            onClick={() => {
              ipcRenderer.invoke('add-lib', libValue).then(results => {
                setLibs(results);
                setLibValue('');
              });
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
