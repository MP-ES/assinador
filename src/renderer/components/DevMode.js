import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Heading,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  Stack,
  Text
} from '@chakra-ui/core';
import { FaKey, FaPlus, FaRecycle, FaTrash } from 'react-icons/fa';
import { ipcRenderer } from 'electron';

export default function DevMode({ isOpen, onClose }) {
  const [devCerts, setDevCerts] = React.useState([]);
  const [devMode, setDevMode] = React.useState(false);
  const [changingDevMode, setChangingDevMode] = React.useState(false);

  React.useEffect(() => {
    ipcRenderer.invoke('get-dev-mode').then(results => setDevMode(results));
  }, []);
  React.useEffect(() => {
    ipcRenderer.invoke('get-dev-certs').then(results => setDevCerts(results));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      closeOnEsc={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text isTruncated>Modo de desenvolvimento</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack align="center" isInline my={2}>
            <Heading size="md">Habilitado:</Heading>
            <Button
              size="sm"
              variantColor="white"
              variant="outline"
              leftIcon={FaRecycle}
              isLoading={changingDevMode}
              onClick={() => {
                setChangingDevMode(true);
                ipcRenderer
                  .invoke('set-dev-mode', !devMode)
                  .then(results => setDevMode(results))
                  .finally(() => setChangingDevMode(false));
              }}
            >
              {devMode ? 'Sim' : 'Não'}
            </Button>
          </Stack>

          <Stack align="center" isInline my={2}>
            <Heading size="md">Certificados:</Heading>
            <Button
              size="sm"
              leftIcon={FaPlus}
              variantColor="green"
              onClick={() => {
                ipcRenderer
                  .invoke('add-cert', true)
                  .then(results => setDevCerts(results));
              }}
            >
              Adicionar
            </Button>
          </Stack>
          {devCerts.length === 0 ? (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              justifyContent="center"
              textAlign="center"
            >
              <Stack isInline my={4}>
                <AlertIcon />
                <AlertTitle mr={2}>Nenhum certificado encontrado.</AlertTitle>
              </Stack>
              <AlertDescription>
                Certifique-se que o token relacionado a biblioteca está inserido
                corretamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Stack spacing={2}>
              {devCerts.map(cert => (
                <Stack
                  key={cert}
                  shadow="md"
                  p={2}
                  borderWidth="1px"
                  spacing={2}
                >
                  <Stack isInline align="center">
                    <Box as={FaKey} color="blue.500" />
                    <Text>{cert.displayName}</Text>
                  </Stack>
                  <Stack isInline align="center" justify="space-between">
                    <Button
                      variant="link"
                      size="sm"
                      variantColor={cert.valid ? 'green' : 'red'}
                      onClick={() => {
                        ipcRenderer
                          .invoke('toggle-cert-valid', cert.id)
                          .then(results => setDevCerts(results));
                      }}
                    >
                      {cert.valid ? 'válido' : 'inválido'}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      variantColor={cert.throwError ? 'red' : 'green'}
                      onClick={() => {
                        ipcRenderer
                          .invoke('toggle-cert-error', cert.id)
                          .then(results => setDevCerts(results));
                      }}
                    >
                      {cert.throwError ? 'com erro' : 'sem erro'}
                    </Button>
                    <IconButton
                      icon={FaTrash}
                      variantColor="red"
                      size="sm"
                      onClick={() => {
                        ipcRenderer
                          .invoke('remove-cert', cert.id)
                          .then(results => setDevCerts(results));
                      }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
DevMode.propTypes = {
  isOpen: PropTypes.boolean,
  onClose: PropTypes.func
};
