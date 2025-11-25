import { Box, Heading, useColorModeValue, Button, Flex, useDisclosure } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DrillDownModal } from './DrillDownModal';

interface Props {
  title: string;
  data: { [key: string]: string | number }[];
  dataKey: string;
  valueKey: string;
}

export function BreakdownChart({ title, data, dataKey, valueKey }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const barColor = useColorModeValue("#7C73E6", "#c4b5fd");
  const axisColor = useColorModeValue("#4a5568", "#cbd5f5");
  const gridColor = useColorModeValue("#e2e8f0", "#2d3748");

  return (
    <>
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={5}
        boxShadow="sm"
        height="320px"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm">{title}</Heading>
          <Button size="xs" variant="ghost" onClick={onOpen}>
            View Details
          </Button>
        </Flex>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey={dataKey} stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <Tooltip />
            <Bar dataKey={valueKey} fill={barColor} radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <DrillDownModal isOpen={isOpen} onClose={onClose} title={title} data={data} />
    </>
  );
}

