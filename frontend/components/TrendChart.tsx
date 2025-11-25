import { Box, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { period: string; value: number }[];
}

export function TrendChart({ data }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const accent = useColorModeValue("#5E4AE3", "#c4b5fd");
  const gridColor = useColorModeValue("#e2e8f0", "#2d3748");
  const axisColor = useColorModeValue("#4a5568", "#cbd5f5");

  return (
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
        <Heading size="sm">Net Sales Trend</Heading>
      </Flex>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accent} stopOpacity={0.8} />
              <stop offset="95%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="period" stroke={axisColor} />
          <YAxis stroke={axisColor} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={accent} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

