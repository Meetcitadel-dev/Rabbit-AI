import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  data: {
    campaign_name: string;
    net_sales: number;
    marketing_spend: number;
    roi: number;
  }[];
}

export function MarketingRoiChart({ data }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const barColor = useColorModeValue("#38B2AC", "#81E6D9");
  const axisColor = useColorModeValue("#4a5568", "#cbd5f5");
  const gridColor = useColorModeValue("#e2e8f0", "#2d3748");

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={6}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      height="100%"
    >
      <Heading size="sm" mb={4}>
        Marketing ROI by Campaign
      </Heading>
      <Box height="260px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="campaign_name" stroke={axisColor} hide={data.length > 5} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis stroke={axisColor} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} labelFormatter={(label) => label} />
            <Bar dataKey="roi" fill={barColor} radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
