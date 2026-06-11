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
} from '@chakra-ui/react';
import { FaKey, FaPlus, FaRecycle, FaTrash } from 'react-icons/fa';

export default function DevMode({ isOpen, onClose }) {
  const [devCerts, setDevCerts] = React.useState([]);
  const [devMode, setDevMode] = React.useState(false);
  const [changingDevMode, setChangingDevMode] = React.useState(false);

  React.useEffect(() => {
    window.electronAPI.getDevMode().then(results => setDevMode(results));
  }, []);
  React.useEffect(() => {
    window.electronAPI.getDevCerts().then(results => setDevCerts(results));
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
          <Stack align="center" direction="row" my={2}>
            <Heading size="md">Habilitado:</Heading>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaRecycle />}
              isLoading={changingDevMode}
              onClick={() => {
                setChangingDevMode(true);
                window.electronAPI
                  .setDevMode(!devMode)
                  .then(results => setDevMode(results))
                  .finally(() => setChangingDevMode(false));
              }}
            >
              {devMode ? 'Sim' : 'Não'}
            </Button>
          </Stack>

          <Stack align="center" direction="row" my={2}>
            <Heading size="md">Certificados:</Heading>
            <Button
              size="sm"
              leftIcon={<FaPlus />}
              colorScheme="green"
              onClick={() => {
                window.electronAPI
                  .addCert(true)
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
              <Stack direction="row" my={4}>
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
                  key={cert.id}
                  shadow="md"
                  p={2}
                  borderWidth="1px"
                  spacing={2}
                >
                  <Stack direction="row" align="center">
                    <Box as={FaKey} color="blue.500" />
                    <Text>{cert.displayName}</Text>
                  </Stack>
                  <Stack direction="row" align="center" justify="space-between">
                    <Button
                      variant="link"
                      size="sm"
                      colorScheme={cert.valid ? 'green' : 'red'}
                      onClick={() => {
                        window.electronAPI
                          .toggleCertValid(cert.id)
                          .then(results => setDevCerts(results));
                      }}
                    >
                      {cert.valid ? 'válido' : 'inválido'}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      colorScheme={cert.throwError ? 'red' : 'green'}
                      onClick={() => {
                        window.electronAPI
                          .toggleCertError(cert.id)
                          .then(results => setDevCerts(results));
                      }}
                    >
                      {cert.throwError ? 'com erro' : 'sem erro'}
                    </Button>
                    <IconButton
                      icon={<FaTrash />}
                      colorScheme="red"
                      size="sm"
                      aria-label="Remover certificado"
                      onClick={() => {
                        window.electronAPI
                          .removeCert(cert.id)
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
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};
