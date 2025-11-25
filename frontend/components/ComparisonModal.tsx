import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Input,
  Button,
  useToast,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export function ComparisonModal({ isOpen, onClose }: Props) {
  const [baseStart, setBaseStart] = useState('');
  const [baseEnd, setBaseEnd] = useState('');
  const [compareStart, setCompareStart] = useState('');
  const [compareEnd, setCompareEnd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleCompare = async () => {
    if (!baseStart || !baseEnd || !compareStart || !compareEnd) {
      toast({
        title: 'Missing dates',
        description: 'Please fill all date fields',
        status: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_start: baseStart, base_end: baseEnd, compare_start: compareStart, compare_end: compareEnd }),
      });
      if (!res.ok) throw new Error('Comparison failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast({
        title: 'Comparison failed',
        description: (err as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent bg={cardBg}>
        <ModalHeader>Period Comparison</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align='stretch'>
            <Text fontWeight='semibold'>Base Period</Text>
            <HStack>
              <Input type='date' value={baseStart} onChange={(e) => setBaseStart(e.target.value)} />
              <Input type='date' value={baseEnd} onChange={(e) => setBaseEnd(e.target.value)} />
            </HStack>

            <Text fontWeight='semibold' mt={2}>Compare Period</Text>
            <HStack>
              <Input type='date' value={compareStart} onChange={(e) => setCompareStart(e.target.value)} />
              <Input type='date' value={compareEnd} onChange={(e) => setCompareEnd(e.target.value)} />
            </HStack>

            <Button colorScheme='purple' onClick={handleCompare} isLoading={loading}>
              Run Comparison
            </Button>

            {result && (
              <VStack spacing={3} align='stretch' mt={4}>
                <Stat>
                  <StatLabel>Total Sales</StatLabel>
                  <StatNumber>
                    ${(result.compare.total_sales / 1_000_000).toFixed(2)}M
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={result.delta.total_sales >= 0 ? 'increase' : 'decrease'} />
                    ${Math.abs(result.delta.total_sales / 1_000_000).toFixed(2)}M
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Units Sold</StatLabel>
                  <StatNumber>{result.compare.total_units.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={result.delta.total_units >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(result.delta.total_units).toLocaleString()}
                  </StatHelpText>
                </Stat>
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

