import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  Stack,
  Text
} from '@chakra-ui/core';
import { FaKey } from 'react-icons/fa';

export default function Certs({ isOpen, onClose, library, certs }) {
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
          <Text isTruncated>{library}</Text>
        </ModalHeader>
        <ModalBody>
          {certs.length === 0 ? (
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
              {certs.map(cert => (
                <Stack
                  key={cert}
                  spacing={2}
                  isInline
                  align="center"
                  shadow="md"
                  p={2}
                  borderWidth="1px"
                >
                  <Box as={FaKey} color="blue.500" />
                  <Text>{cert.displayName}</Text>
                </Stack>
              ))}
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
Certs.propTypes = {
  isOpen: PropTypes.boolean,
  onClose: PropTypes.func,
  library: PropTypes.string,
  certs: PropTypes.array
};
