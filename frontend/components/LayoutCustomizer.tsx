import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  Text,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';

export type LayoutConfig = {
  showKpis: boolean;
  showTrend: boolean;
  showRegionalSplit: boolean;
  showCategoryMix: boolean;
  showChat: boolean;
  showInsights: boolean;
  showInventory: boolean;
  showSupply: boolean;
  showMarketing: boolean;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: LayoutConfig;
  onChange: (config: LayoutConfig) => void;
}

export function LayoutCustomizer({ isOpen, onClose, config, onChange }: Props) {
  const drawerBg = useColorModeValue('white', 'gray.800');

  const handleToggle = (key: keyof LayoutConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg={drawerBg}>
        <DrawerCloseButton />
        <DrawerHeader>Customize Dashboard</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align='stretch'>
            <Text fontSize='sm' fontWeight='semibold' color='gray.500'>
              Visible Widgets
            </Text>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='kpis' mb='0' flex='1'>
                KPI Cards
              </FormLabel>
              <Switch
                id='kpis'
                isChecked={config.showKpis}
                onChange={() => handleToggle('showKpis')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='trend' mb='0' flex='1'>
                Sales Trend Chart
              </FormLabel>
              <Switch
                id='trend'
                isChecked={config.showTrend}
                onChange={() => handleToggle('showTrend')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='regional' mb='0' flex='1'>
                Regional Split
              </FormLabel>
              <Switch
                id='regional'
                isChecked={config.showRegionalSplit}
                onChange={() => handleToggle('showRegionalSplit')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='category' mb='0' flex='1'>
                Category Mix
              </FormLabel>
              <Switch
                id='category'
                isChecked={config.showCategoryMix}
                onChange={() => handleToggle('showCategoryMix')}
              />
            </FormControl>

            <Divider />

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='chat' mb='0' flex='1'>
                Chat Panel
              </FormLabel>
              <Switch
                id='chat'
                isChecked={config.showChat}
                onChange={() => handleToggle('showChat')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='insights' mb='0' flex='1'>
                Insight Highlights
              </FormLabel>
              <Switch
                id='insights'
                isChecked={config.showInsights}
                onChange={() => handleToggle('showInsights')}
              />
            </FormControl>

            <Divider />

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='inventory' mb='0' flex='1'>
                Inventory Analytics
              </FormLabel>
              <Switch
                id='inventory'
                isChecked={config.showInventory}
                onChange={() => handleToggle('showInventory')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='supply' mb='0' flex='1'>
                Supply Chain Metrics
              </FormLabel>
              <Switch
                id='supply'
                isChecked={config.showSupply}
                onChange={() => handleToggle('showSupply')}
              />
            </FormControl>

            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='marketing' mb='0' flex='1'>
                Marketing Performance
              </FormLabel>
              <Switch
                id='marketing'
                isChecked={config.showMarketing}
                onChange={() => handleToggle('showMarketing')}
              />
            </FormControl>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

