import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from "@chakra-ui/react";

interface Props {
  metrics: {
    avg_lead_time: number;
    fulfillment_rate: number;
    backorder_rate: number;
  } | null;
}

export function SupplyChainStats({ metrics }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  if (!metrics) return null;

  return (
    <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
      <Heading size="sm" mb={4}>
        Supply Chain Health
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <Stat>
          <StatLabel>Avg Lead Time</StatLabel>
          <StatNumber>{metrics.avg_lead_time.toFixed(1)} days</StatNumber>
          <StatHelpText>Procurement to shelf</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Fulfillment Rate</StatLabel>
          <StatNumber>{(metrics.fulfillment_rate * 100).toFixed(1)}%</StatNumber>
          <StatHelpText>Orders shipped on time</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Backorder Rate</StatLabel>
          <StatNumber>{(metrics.backorder_rate * 100).toFixed(1)}%</StatNumber>
          <StatHelpText>Orders delayed</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}
