import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';

interface Props {
  filters: Record<string, unknown>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export function ExportMenu({ filters }: Props) {
  const toast = useToast();
  const menuBg = useColorModeValue('white', 'gray.800');

  const handleExport = async (format: string) => {
    try {
      const payload = { ...filters, format, metric: 'all' };
      const res = await fetch(`${API_BASE}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rabbitt_export.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Downloaded as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: (err as Error).message,
        status: 'error',
      });
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={<Icon as={FiDownload} />}
        size='sm'
        variant='outline'
      >
        Export
      </MenuButton>
      <MenuList bg={menuBg}>
        <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
      </MenuList>
    </Menu>
  );
}

