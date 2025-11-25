'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Flex,
  Stack,
  useColorModeValue,
  HStack,
  Button,
} from '@chakra-ui/react';
import { FilterBar, FilterState } from '../components/FilterBar';
import { KpiGrid } from '../components/KpiGrid';
import { TrendChart } from '../components/TrendChart';
import { BreakdownChart } from '../components/BreakdownChart';
import { ChatPanel } from '../components/ChatPanel';
import {
  fetchAnomalies,
  fetchBreakdown,
  fetchFilters,
  fetchKpis,
  fetchRecommendations,
  fetchSeries,
  KPIBlock,
} from '../lib/api';
import { PersonaOption, PersonaSelector } from '../components/PersonaSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { InsightHighlights } from '../components/InsightHighlights';
import { ExportMenu } from '../components/ExportMenu';
import { ComparisonModal } from '../components/ComparisonModal';
import { LayoutCustomizer, LayoutConfig } from '../components/LayoutCustomizer';

type FilterOptions = {
  regions: string[];
  categories: string[];
  channels: string[];
  promo_flags: string[];
  date_range: [string, string];
};

const initialOptions: FilterOptions = {
  regions: [],
  categories: [],
  channels: [],
  promo_flags: [],
  date_range: ['', ''],
};

const STORAGE_KEY = 'talking_rabbitt_filters';
const LAYOUT_STORAGE_KEY = 'talking_rabbitt_layout';
const basePrompts = [
  'Show me last quarter performance.',
  'Which promos over-indexed?',
  'Where are we losing momentum?',
];

const defaultLayout: LayoutConfig = {
  showKpis: true,
  showTrend: true,
  showRegionalSplit: true,
  showCategoryMix: true,
  showChat: true,
  showInsights: true,
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>({});
  const [options, setOptions] = useState<FilterOptions>(initialOptions);
  const [kpis, setKpis] = useState<KPIBlock>();
  const [series, setSeries] = useState<{ period: string; value: number }[]>([]);
  const [regionSplit, setRegionSplit] = useState<{ [key: string]: string | number }[]>([]);
  const [categorySplit, setCategorySplit] = useState<{ [key: string]: string | number }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [anomalies, setAnomalies] = useState<
    { date: string; metric: string; value: number; z_score: number }[]
  >([]);
  const [quickPrompts, setQuickPrompts] = useState<string[]>(basePrompts);
  const [activePersona, setActivePersona] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(defaultLayout);
  const pageBg = useColorModeValue('gray.50', '#0b1120');
  const headingColor = useColorModeValue('gray.900', 'white');
  const subheadingColor = useColorModeValue('gray.600', 'gray.300');

  const serializedFilters = useMemo(() => serializeFilters(filters), [filters]);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const filterOptions = await fetchFilters();
        setOptions({
          regions: filterOptions.regions,
          categories: filterOptions.categories,
          channels: filterOptions.channels,
          promo_flags: filterOptions.promo_flags,
          date_range: filterOptions.date_range,
        });
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const initial = saved ? (JSON.parse(saved) as FilterState) : {};
        if (!initial.start && filterOptions.date_range?.[0]) {
          initial.start = filterOptions.date_range[0];
        }
        if (!initial.end && filterOptions.date_range?.[1]) {
          initial.end = filterOptions.date_range[1];
        }
        setFilters(initial);
        await hydrateMetrics(initial);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      setLayoutConfig(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  const hydrateMetrics = async (nextFilters: FilterState) => {
    setLoading(true);
    try {
      const payload = serializeFilters(nextFilters);
      const [
        kpiData,
        seriesData,
        regionData,
        categoryData,
        recs,
        anomalyData,
      ] = await Promise.all([
        fetchKpis(payload),
        fetchSeries(payload),
        fetchBreakdown(payload, 'region'),
        fetchBreakdown(payload, 'category'),
        fetchRecommendations(payload),
        fetchAnomalies(payload),
      ]);
      setKpis(kpiData);
      setSeries(seriesData);
      setRegionSplit(regionData);
      setCategorySplit(categoryData);
      setRecommendations(recs);
      setAnomalies(anomalyData);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (next: FilterState) => {
    setFilters(next);
    hydrateMetrics(next);
    setActivePersona(undefined);
  };

  const handleResetFilters = () => {
    const base: FilterState = {
      start: options.date_range?.[0],
      end: options.date_range?.[1],
    };
    setFilters(base);
    hydrateMetrics(base);
    setActivePersona(undefined);
    setQuickPrompts(basePrompts);
  };

  const handlePersonaSelect = (persona: PersonaOption) => {
    setActivePersona(persona.id);
    const personaFilters = {
      ...filters,
      ...persona.filters,
    };
    setFilters(personaFilters);
    setQuickPrompts([persona.prompt, ...basePrompts.slice(0, 2)]);
    hydrateMetrics(personaFilters);
  };

  return (
    <Box bg={pageBg} minH='100vh' py={10}>
      <Container maxW='7xl'>
        <Flex justify='space-between' align='center' mb={2}>
          <Box>
            <Heading size='lg' color={headingColor}>
              Talking Rabbitt Dashboard
            </Heading>
            <Text color={subheadingColor}>
              Conversational insights across categories, regions, and promotions.
            </Text>
          </Box>
          <HStack spacing={3}>
            <ExportMenu filters={serializedFilters} />
            <Button size='sm' variant='outline' onClick={() => setIsComparisonOpen(true)}>
              Compare Periods
            </Button>
            <Button size='sm' variant='outline' onClick={() => setIsLayoutOpen(true)}>
              Customize Layout
            </Button>
            <ThemeToggle />
          </HStack>
        </Flex>

        <ComparisonModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} />
        <LayoutCustomizer
          isOpen={isLayoutOpen}
          onClose={() => setIsLayoutOpen(false)}
          config={layoutConfig}
          onChange={setLayoutConfig}
        />

        <Stack spacing={4} mt={6}>
          <PersonaSelector activePersona={activePersona} onSelect={handlePersonaSelect} />
          <FilterBar
            options={options}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </Stack>

        {loading && !kpis ? (
          <Spinner mt={10} color='purple.400' />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 1 }} mt={6} spacing={6}>
            {layoutConfig.showKpis && <KpiGrid data={kpis} />}
            {layoutConfig.showTrend && <TrendChart data={series} />}

            {(layoutConfig.showChat || layoutConfig.showInsights) && (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                {layoutConfig.showChat && (
                  <GridItem>
                    <ChatPanel filters={serializedFilters} quickPrompts={quickPrompts} />
                  </GridItem>
                )}
                {layoutConfig.showInsights && (
                  <GridItem>
                    <InsightHighlights recommendations={recommendations} anomalies={anomalies} />
                  </GridItem>
                )}
              </Grid>
            )}

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
              {layoutConfig.showRegionalSplit && (
                <BreakdownChart
                  title='Regional Split'
                  data={regionSplit}
                  dataKey='region'
                  valueKey='value'
                />
              )}
              {layoutConfig.showCategoryMix && (
                <BreakdownChart
                  title='Category Mix'
                  data={categorySplit}
                  dataKey='category'
                  valueKey='value'
                />
              )}
            </Grid>
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

function serializeFilters(filters: FilterState) {
  const payload: Record<string, unknown> = {};
  if (filters.region) payload.region = [filters.region];
  if (filters.category) payload.category = [filters.category];
  if (filters.channel) payload.channel = [filters.channel];
  if (filters.promo_flag) payload.promo_flag = [filters.promo_flag];
  if (filters.start) payload.start = filters.start;
  if (filters.end) payload.end = filters.end;
  return payload;
}

