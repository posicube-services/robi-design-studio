import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

/**
 * @od-component InvoiceBlock
 * @mui components=Card,Table,Typography,Chip
 * @notes Invoice / 견적서 document: header (번호·발행일·수신처·상태) + line-item
 *   table (품목·수량·단가·금액) with computed amounts, and a totals footer
 *   (소계 + 세금% → 합계). Items are literal — the LLM supplies them; amounts
 *   and totals are computed here so numbers always add up.
 * @posicube-minimal version=0.1.0
 */
type LineItem = { description?: string; quantity?: number; unitPrice?: number };

function currency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function InvoiceBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    invoiceNo?: string;
    issueDate?: string;
    billTo?: string;
    status?: string;
    taxRate?: number; // percent
    items?: LineItem[];
  };

  const items = Array.isArray(props.items) ? props.items : [];
  const rows = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return { description: item.description ?? '', qty, price, amount: qty * price };
  });

  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
  const taxRate = Number(props.taxRate) || 0;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  return (
    <Card sx={{ p: 4 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5">{props.invoiceNo ?? 'INVOICE'}</Typography>
          {props.issueDate && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              발행일: {props.issueDate}
            </Typography>
          )}
        </Box>
        <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
          {props.status && <Chip size="small" variant="soft" color="primary" label={props.status} />}
          {props.billTo && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              수신: {props.billTo}
            </Typography>
          )}
        </Stack>
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>품목</TableCell>
              <TableCell align="right">수량</TableCell>
              <TableCell align="right">단가</TableCell>
              <TableCell align="right">금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right">{row.qty}</TableCell>
                <TableCell align="right">{currency(row.price)}</TableCell>
                <TableCell align="right">{currency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1} sx={{ maxWidth: 280, ml: 'auto' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>소계</Typography>
          <Typography variant="body2">{currency(subtotal)}</Typography>
        </Stack>
        {taxRate > 0 && (
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>세금 ({taxRate}%)</Typography>
            <Typography variant="body2">{currency(tax)}</Typography>
          </Stack>
        )}
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">합계</Typography>
          <Typography variant="subtitle1">{currency(total)}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
