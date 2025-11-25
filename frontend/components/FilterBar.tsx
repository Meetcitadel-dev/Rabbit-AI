import {
  Box,
  Flex,
  Select,
  Text,
  VStack,
  Button,
  useDisclosure,
  Stack,
  Input,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { DateRangePresets, DatePreset } from './DateRangePresets';
import { useEffect, useState } from "react";

type FilterOption = {
  regions: string[];
  categories: string[];
  channels: string[];
  promo_flags: string[];
  date_range: [string, string];
};

export type FilterState = {
  region?: string;
  category?: string;
  channel?: string;
  promo_flag?: string;
  start?: string;
  end?: string;
};

interface Props {
  options: FilterOption;
  onApply: (filters: FilterState) => void;
  onReset?: () => void;
}

export function FilterBar({ options, onApply, onReset }: Props) {
  const [localFilters, setLocalFilters] = useState<FilterState>({});
  const disclosure = useDisclosure({ defaultIsOpen: true });
  const cardBg = useColorModeValue("white", "gray.800");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const fieldBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      start: prev.start ?? options.date_range?.[0],
      end: prev.end ?? options.date_range?.[1],
    }));
  }, [options.date_range]);

  const handleChange = (key: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handlePresetSelect = (preset: DatePreset) => {
    setLocalFilters((prev) => ({
      ...prev,
      start: preset.start,
      end: preset.end,
    }));
  };

  const handleReset = () => {
    setLocalFilters({
      start: options.date_range?.[0],
      end: options.date_range?.[1],
    });
    onReset?.();
  };

  return (
    <Box bg={cardBg} borderRadius="lg" px={5} py={4} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="semibold">Filters</Text>
        <Button size="sm" variant="ghost" onClick={disclosure.onToggle}>
          {disclosure.isOpen ? "Hide" : "Show"}
        </Button>
      </Flex>
      {disclosure.isOpen && (
        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <VStack align="start" flex={1}>
            <Text fontSize="sm" color={labelColor}>
              Region
            </Text>
            <Select
              placeholder="All regions"
              value={localFilters.region ?? ""}
              onChange={(e) => handleChange("region", e.target.value)}
              bg={fieldBg}
            >
              {options.regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </Select>
          </VStack>
          <VStack align="start" flex={1}>
            <Text fontSize="sm" color={labelColor}>
              Category
            </Text>
            <Select
              placeholder="All categories"
              value={localFilters.category ?? ""}
              onChange={(e) => handleChange("category", e.target.value)}
              bg={fieldBg}
            >
              {options.categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </Select>
          </VStack>
          <VStack align="start" flex={1}>
            <Text fontSize="sm" color={labelColor}>
              Channel
            </Text>
            <Select
              placeholder="All channels"
              value={localFilters.channel ?? ""}
              onChange={(e) => handleChange("channel", e.target.value)}
              bg={fieldBg}
            >
              {options.channels.map((channel) => (
                <option key={channel}>{channel}</option>
              ))}
            </Select>
          </VStack>
          <VStack align="start" flex={1}>
            <Text fontSize="sm" color={labelColor}>
              Promo Flag
            </Text>
            <Select
              placeholder="All promos"
              value={localFilters.promo_flag ?? ""}
              onChange={(e) => handleChange("promo_flag", e.target.value)}
              bg={fieldBg}
            >
              {(options.promo_flags ?? []).map((flag) => (
                <option key={flag}>{flag}</option>
              ))}
            </Select>
          </VStack>
        </Stack>
      )}
      {disclosure.isOpen && (
        <>
          <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={4}>
            <VStack align="start" flex={1}>
              <Text fontSize="sm" color={labelColor}>
                Start Date
              </Text>
              <Input
                type="date"
                value={localFilters.start ?? ""}
                onChange={(e) => handleChange("start", e.target.value)}
                bg={fieldBg}
              />
            </VStack>
            <VStack align="start" flex={1}>
              <Text fontSize="sm" color={labelColor}>
                End Date
              </Text>
              <Input
                type="date"
                value={localFilters.end ?? ""}
                onChange={(e) => handleChange("end", e.target.value)}
                bg={fieldBg}
              />
            </VStack>
            <VStack justify="end">
              <HStack>
                <Button variant="ghost" onClick={handleReset}>
                  Reset
                </Button>
                <Button colorScheme="purple" onClick={() => onApply(localFilters)}>
                  Apply
                </Button>
              </HStack>
            </VStack>
          </Stack>
          <Box mt={3}>
            <Text fontSize="xs" color={labelColor} mb={2}>Quick Ranges:</Text>
            <DateRangePresets onSelect={handlePresetSelect} />
          </Box>
        </>
      )}
    </Box>
  );
}

