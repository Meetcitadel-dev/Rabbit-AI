import { Button, HStack, useColorModeValue } from '@chakra-ui/react';

export type DatePreset = {
  label: string;
  start: string;
  end: string;
  isDefault?: boolean;
};

interface Props {
  onSelect: (preset: DatePreset) => void;
  baseRange?: [string, string];
}

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export function DateRangePresets({ onSelect, baseRange }: Props) {
  const buttonBg = useColorModeValue('gray.100', 'gray.700');

  const presets: DatePreset[] = [
    {
      label: 'General (All Data)',
      start: baseRange?.[0] ?? '',
      end: baseRange?.[1] ?? today(),
      isDefault: true,
    },
    {
      label: 'Last 7 Days',
      start: daysAgo(7),
      end: today(),
    },
    {
      label: 'Last 30 Days',
      start: daysAgo(30),
      end: today(),
    },
    {
      label: 'Quarter to Date',
      start: daysAgo(90),
      end: today(),
    },
    {
      label: 'Last 6 Months',
      start: daysAgo(180),
      end: today(),
    },
    {
      label: 'YTD',
      start: `${new Date().getFullYear()}-01-01`,
      end: today(),
    },
  ];

  return (
    <HStack spacing={2} wrap='wrap'>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          size='xs'
          variant={preset.isDefault ? 'solid' : 'ghost'}
          bg={preset.isDefault ? undefined : buttonBg}
          onClick={() => onSelect(preset)}
        >
          {preset.label}
        </Button>
      ))}
    </HStack>
  );
}

