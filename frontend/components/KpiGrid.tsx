import {
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from "@chakra-ui/react";
import { KPIBlock } from "../lib/api";

interface Props {
  data?: KPIBlock;
}

export function KpiGrid({ data }: Props) {
  if (!data) return null;
  const cardBg = useColorModeValue("white", "gray.800");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const numberColor = useColorModeValue("gray.900", "white");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  const items = [
    {
      label: "Net Sales",
      value: `$${(data.total_sales / 1_000_000).toFixed(2)}M`,
      help: "Total revenue",
    },
    {
      label: "Units Sold",
      value: data.total_units.toLocaleString(),
      help: "Shipped units",
    },
    {
      label: "Avg Discount",
      value: `${(data.avg_discount * 100).toFixed(1)}%`,
      help: "Across applied promos",
    },
    {
      label: "Marketing Efficiency",
      value: data.marketing_efficiency.toFixed(2),
      help: "Sales per marketing $",
    },
    {
      label: "Growth vs Prior",
      value: `${(data.growth_vs_prev_period * 100).toFixed(1)}%`,
      help: "Period over period",
    },
  ];

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
      {items.map((item) => (
        <GridItem
          key={item.label}
          bg={cardBg}
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel color={labelColor}>{item.label}</StatLabel>
            <StatNumber color={numberColor}>{item.value}</StatNumber>
            <StatHelpText>{item.help}</StatHelpText>
          </Stat>
        </GridItem>
      ))}
    </Grid>
  );
}

