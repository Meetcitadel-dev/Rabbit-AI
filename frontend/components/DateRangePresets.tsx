import { Button, HStack, useColorModeValue } from '@chakra-ui/react';

export type DatePreset = {
  label: string;
  start: string;
  end: string;
};

interface Props {
  onSelect: (preset: DatePreset) => void;
}

export function DateRangePresets({ onSelect }: Props) {
  const buttonBg = useColorModeValue('gray.100', 'gray.700');

  const presets: DatePreset[] = [
    {
      label: 'Last 7 Days',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    {
      label: 'Last 30 Days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    {
      label: 'Last Quarter',
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    {
      label: 'YTD',
      start: `${new Date().getFullYear()}-01-01`,
      end: new Date().toISOString().split('T')[0],
    },
  ];

  return (
    <HStack spacing={2} wrap='wrap'>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          size='xs'
          variant='ghost'
          bg={buttonBg}
          onClick={() => onSelect(preset)}
        >
          {preset.label}
        </Button>
      ))}
    </HStack>
  );
}

