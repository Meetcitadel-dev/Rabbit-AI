"use client";

import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface InventoryTrendProps {
  summary: {
    total_inventory: number;
    forecast_demand: number;
    variance: number;
    coverage_days: number;
    stockout_risk: number;
  } | null;
  series: { date: string; inventory: number; forecast: number }[];
}

export function InventoryTrend({ summary, series }: InventoryTrendProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const inventoryColor = useColorModeValue("#3182CE", "#63B3ED");
  const forecastColor = useColorModeValue("#805AD5", "#B794F4");
  const axisColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={6}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Heading size="sm" mb={4}>
        Inventory vs Forecast
      </Heading>
      {summary && (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={4}>
          <Stat>
            <StatLabel>Total Inventory</StatLabel>
            <StatNumber>{summary.total_inventory.toLocaleString()}</StatNumber>
            <StatHelpText>Units available</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Forecast Demand</StatLabel>
            <StatNumber>{summary.forecast_demand.toLocaleString()}</StatNumber>
            <StatHelpText>Upcoming units</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Coverage</StatLabel>
            <StatNumber>{summary.coverage_days} days</StatNumber>
            <StatHelpText>At current burn</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Stockout Risk</StatLabel>
            <StatNumber>{(summary.stockout_risk * 100).toFixed(1)}%</StatNumber>
            <StatHelpText>Variance {summary.variance.toLocaleString()} units</StatHelpText>
          </Stat>
        </SimpleGrid>
      )}
      <Box height="280px">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey="date" stroke={axisColor} hide={series.length > 60} />
            <YAxis stroke={axisColor} />
            <Tooltip />
            <Area type="monotone" dataKey="forecast" stroke={forecastColor} fillOpacity={0.15} fill={forecastColor} name="Forecast" />
            <Area type="monotone" dataKey="inventory" stroke={inventoryColor} fillOpacity={0.3} fill={inventoryColor} name="Inventory" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
