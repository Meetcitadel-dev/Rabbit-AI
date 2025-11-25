import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from '@chakra-ui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Array<{ [key: string]: string | number }>;
}

export function DrillDownModal({ isOpen, onClose, title, data }: Props) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
      <ModalOverlay />
      <ModalContent bg={cardBg}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align='stretch'>
            <Text fontSize='sm' color='gray.500'>
              Showing {data.length} rows
            </Text>
            <Table size='sm' variant='simple'>
              <Thead bg={headerBg}>
                <Tr>
                  {keys.map((key) => (
                    <Th key={key}>{key}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.slice(0, 50).map((row, idx) => (
                  <Tr key={idx}>
                    {keys.map((key) => (
                      <Td key={key}>
                        {typeof row[key] === 'number'
                          ? row[key].toLocaleString()
                          : row[key]}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

