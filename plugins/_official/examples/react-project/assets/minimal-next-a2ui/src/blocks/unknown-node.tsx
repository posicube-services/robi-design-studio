import Box from '@mui/material/Box';

/**
 * @od-component UnknownNode
 * @mui components=Box
 * @notes Visible diagnostic for a missing node id or unregistered node type.
 *   Fails loud (not silent) so a hallucinated LLM spec is obvious in review.
 * @posicube-minimal version=0.1.0
 */
export function UnknownNode({ label }: { label: string }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 2,
        py: 1.5,
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'error.main',
        bgcolor: 'error.lighter',
        color: 'error.dark',
        fontSize: 13,
        fontFamily: 'monospace',
      }}
    >
      ⚠ genui: {label}
    </Box>
  );
}
