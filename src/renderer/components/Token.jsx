import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Stack,
  Text,
  useClipboard,
  useToast
} from '@chakra-ui/react';
import { FaTrash, FaList } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

import Certs from './Certs';

export default function Token({ library, setLibs }) {
  const [openModal, setOpenModal] = React.useState(false);
  const [certs, setCerts] = React.useState([]);

  const toast = useToast();
  const { onCopy } = useClipboard(library);

  const handleIconClick = e => {
    e.preventDefault();
    onCopy();
    toast({
      description: 'caminho copiado',
      status: 'success',
      duration: 2000,
      isClosable: false,
      position: 'top'
    });
  };

  return (
    <>
      <Stack
        direction="row"
        align="center"
        shadow="md"
        p={2}
        mb={1}
        borderWidth="1px"
      >
        <Box
          as={MdSettings}
          color="green.500"
          fontSize={32}
          cursor="copy"
          onClick={handleIconClick}
        />
        <Text isTruncated>{library}</Text>
        <IconButton
          icon={<FaList />}
          variant="ghost"
          color="green.500"
          ml="auto"
          aria-label="Listar certificados"
          onClick={() =>
            window.electronAPI.getCertificates(library).then(results => {
              setCerts(results);
              setOpenModal(true);
            })
          }
        />
        <IconButton
          icon={<FaTrash />}
          variant="ghost"
          color="red.500"
          aria-label="Remover biblioteca"
          onClick={() => {
            window.electronAPI
              .removeLib(library)
              .then(results => setLibs(results));
          }}
        />
      </Stack>

      <Certs
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        library={library}
        certs={certs}
      />
    </>
  );
}
Token.propTypes = {
  library: PropTypes.string,
  setLibs: PropTypes.func
};
