import {
  Box,
  Divider,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiTrendingUp } from "react-icons/fi";

interface Props {
  recommendations: string[];
  anomalies: { date: string; metric: string; value: number; z_score: number }[];
}

export function InsightHighlights({ recommendations, anomalies }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const sectionLabel = useColorModeValue("gray.500", "gray.400");
  const anomalyColor = useColorModeValue("orange.400", "orange.300");
  const recColor = useColorModeValue("green.400", "green.300");

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={5}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Heading size="sm" mb={3}>
        AI Highlights
      </Heading>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="xs" textTransform="uppercase" color={sectionLabel} mb={2}>
            Recommendations
          </Text>
          <List spacing={2}>
            {recommendations.map((rec, idx) => (
              <ListItem key={idx} fontSize="sm">
                <ListIcon as={FiTrendingUp} color={recColor} />
                {rec}
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider />
        <Box>
          <Text fontSize="xs" textTransform="uppercase" color={sectionLabel} mb={2}>
            Recent Anomalies
          </Text>
          <List spacing={2}>
            {anomalies.map((anom, idx) => (
              <ListItem key={`${anom.date}-${idx}`} fontSize="sm">
                <ListIcon as={FiAlertTriangle} color={anomalyColor} />
                {anom.metric} {anom.z_score > 0 ? "spike" : "drop"} on {anom.date} (
                {anom.value.toLocaleString()} units, z={anom.z_score})
              </ListItem>
            ))}
          </List>
        </Box>
      </VStack>
    </Box>
  );
}

