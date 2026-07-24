// "Open this file in <editor>" button for the code viewer toolbar. Mirrors the
// project-folder hand-off (HandoffButton) but targets a single file: the main
// button opens the current file in the preferred editor, and the caret menu
// lets the user pick/switch which installed editor to use. The chosen editor is
// persisted in the same `open-design:preferred-editor` localStorage key the
// project hand-off uses, so the two surfaces stay in sync.

import { useEffect, useRef, useState } from 'react';
import type { HostEditor, HostEditorId } from '@open-design/contracts';
import { fetchHostEditors, openProjectInEditor } from '../providers/registry';
import { useT } from '../i18n';
import { Icon } from './Icon';
import { EditorIcon } from './EditorIcon';

const PREFERRED_EDITOR_KEY = 'open-design:preferred-editor';

interface Props {
  projectId: string;
  /** Project-root-relative file path to open. */
  relPath: string;
}

export function OpenFileInEditorButton({ projectId, relPath }: Props) {
  const t = useT();
  const [editors, setEditors] = useState<HostEditor[]>([]);
  const [preferred, setPreferred] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHostEditors()
      .then((resp) => {
        if (!cancelled) setEditors(resp.editors);
      })
      .catch(() => {
        /* best-effort; button just hides when no editors */
      });
    try {
      setPreferred(window.localStorage.getItem(PREFERRED_EDITOR_KEY));
    } catch {
      /* localStorage unavailable */
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const available = editors.filter((e) => e.available);
  if (available.length === 0) return null;

  const effective =
    available.find((e) => e.id === preferred) ?? (available[0] as HostEditor);

  const open = async (id: HostEditorId) => {
    setBusy(true);
    try {
      await openProjectInEditor(projectId, id, relPath);
    } catch {
      /* best-effort — daemon swallows OS-level launch failures too */
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  };

  const choose = (id: HostEditorId) => {
    try {
      window.localStorage.setItem(PREFERRED_EDITOR_KEY, id);
    } catch {
      /* ignore */
    }
    setPreferred(id);
    void open(id);
  };

  return (
    <div className="viewer-open-editor" ref={wrapRef}>
      <button
        type="button"
        className="viewer-action"
        disabled={busy}
        onClick={() => void open(effective.id)}
        title={`${t('fileViewer.openInEditor')} · ${effective.label}`}
      >
        <EditorIcon editorId={effective.id} size={13} />
        <span>{t('fileViewer.openInEditor')}</span>
      </button>
      {available.length > 1 ? (
        <button
          type="button"
          className="viewer-action viewer-open-editor-caret"
          aria-label={t('fileViewer.chooseEditor')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name="chevron-down" size={12} />
        </button>
      ) : null}
      {menuOpen ? (
        <div className="viewer-open-editor-menu" role="menu">
          {available.map((e) => (
            <button
              key={e.id}
              type="button"
              role="menuitem"
              className={
                'viewer-open-editor-item' + (e.id === effective.id ? ' active' : '')
              }
              onClick={() => choose(e.id)}
            >
              <EditorIcon editorId={e.id} size={14} />
              <span>{e.label}</span>
              {e.id === preferred ? <Icon name="check" size={12} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
