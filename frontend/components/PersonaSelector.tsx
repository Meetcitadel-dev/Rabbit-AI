"use client";

import { Badge, Box, Button, HStack, Text, useColorModeValue } from "@chakra-ui/react";

type Persona = {
  id: string;
  label: string;
  description: string;
  filters: {
    region?: string;
    category?: string;
    channel?: string;
    promo_flag?: string;
  };
  prompt: string;
};

const PERSONAS: Persona[] = [
  {
    id: "ceo",
    label: "CEO Mode",
    description: "Topline KPIs & growth",
    filters: { region: undefined, category: undefined },
    prompt: "Summarize this quarter's biggest growth/decline drivers.",
  },
  {
    id: "cmo",
    label: "CMO Mode",
    description: "Marketing efficiency focus",
    filters: { channel: "Online", promo_flag: "Flash" },
    prompt: "Where should we reinvest marketing dollars for the best ROI?",
  },
  {
    id: "merch",
    label: "Merch Ops",
    description: "Category mix & promos",
    filters: { category: "Footwear", promo_flag: "Clearance" },
    prompt: "Which SKUs need promotion to clear inventory?",
  },
];

interface Props {
  activePersona?: string;
  onSelect: (persona: Persona) => void;
}

export function PersonaSelector({ activePersona, onSelect }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const badgeColor = useColorModeValue("purple", "purple");

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={4}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Text fontWeight="semibold" mb={3}>
        Persona Presets
      </Text>
      <HStack spacing={3} flexWrap="wrap">
        {PERSONAS.map((persona) => (
          <Button
            key={persona.id}
            variant={activePersona === persona.id ? "solid" : "outline"}
            colorScheme="purple"
            onClick={() => onSelect(persona)}
          >
            <Box textAlign="left">
              <Text fontWeight="medium">{persona.label}</Text>
              <Badge colorScheme={badgeColor}>{persona.description}</Badge>
            </Box>
          </Button>
        ))}
      </HStack>
    </Box>
  );
}

export type PersonaOption = Persona;

