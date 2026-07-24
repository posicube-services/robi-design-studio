import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { DashboardLayout } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const SUMMARY = [
  { label: 'Weekly sales', value: '714k', icon: 'solar:cart-3-bold', color: 'primary' },
  { label: 'New users', value: '1.35m', icon: 'solar:users-group-rounded-bold-duotone', color: 'info' },
  { label: 'Notifications', value: '1.72m', icon: 'solar:bell-bing-bold-duotone', color: 'warning' },
  { label: 'Messages', value: '234', icon: 'solar:chat-round-dots-bold', color: 'error' },
] as const;

// ----------------------------------------------------------------------

function AreaChart() {
  const chartOptions = useChart({
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    },
    stroke: { width: 3 },
  });

  return (
    <Chart
      type="area"
      series={[{ name: 'Revenue', data: [10, 41, 35, 51, 49, 62, 69, 91] }]}
      options={chartOptions}
      sx={{ height: 320, py: 2 }}
    />
  );
}

// ----------------------------------------------------------------------

export function App() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4">Hi, Welcome back 👋</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              A curated Minimal seed running on Vite + React + MUI.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New report
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {SUMMARY.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 56,
                      height: 56,
                      color: `${item.color}.main`,
                      bgcolor: `${item.color}.lighter`,
                    }}
                  >
                    <Iconify icon={item.icon} width={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{item.value}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="Revenue" subheader="(+43%) than last year" />
              <AreaChart />
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, height: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Status
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Theme</Typography>
                  <Label color="success">Minimal v7</Label>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Bundler</Typography>
                  <Label color="info">Vite</Label>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">Router</Typography>
                  <Label color="warning">react-router</Label>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
