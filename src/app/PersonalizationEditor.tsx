import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { App } from './App';
import { birthday } from '../config/birthday';
import { birthdaySchema, isAssetPath, type ValidatedBirthday } from '../config/schema';
import './editor.css';

function folder(file: File) {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/') || /\.vtt$/i.test(file.name)) return 'videos';
  return 'images/memories';
}

function toModule(config: ValidatedBirthday) {
  return [
    "import { birthdayExample } from './birthday.example';",
    "import { birthdaySchema, type BirthdayConfig } from './schema';",
    '',
    `export const birthday: BirthdayConfig = ${JSON.stringify(config, null, 2)};`,
    '',
    'export const birthdayResult = birthdaySchema.safeParse(birthday);',
    'export const gardenConfig = birthdayResult.success ? birthdayResult.data : birthdaySchema.parse(birthdayExample);',
    '',
  ].join('\n');
}

export default function PersonalizationEditor() {
  const [draft, setDraft] = useState(() => JSON.stringify(birthday, null, 2));
  const [selection, setSelection] = useState<File>();
  const [path, setPath] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [config, setConfig] = useState<ValidatedBirthday>();
  const [assets, setAssets] = useState(new Map<string, { url: string; name: string }>());
  const assetUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = assetUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function validate() {
    try {
      const value: unknown = JSON.parse(draft);
      const checked = birthdaySchema.safeParse(value);
      if (!checked.success) {
        setIssues(checked.error.issues.map((issue) => `${issue.path.join('.') || 'Configuration'} · ${issue.message}`));
        return;
      }
      setIssues([]);
      return checked.data;
    } catch {
      setIssues(['Check that the configuration is valid JSON.']);
    }
  }

  function addAsset(event: FormEvent) {
    event.preventDefault();
    if (!selection || !path.startsWith('/') || !isAssetPath(path)) {
      setIssues(['Choose a file and enter a valid local path, for example /images/memories/favorite.webp.']);
      return;
    }
    const url = URL.createObjectURL(selection);
    assetUrls.current.add(url);
    const previous = assets.get(path);
    if (previous) {
      URL.revokeObjectURL(previous.url);
      assetUrls.current.delete(previous.url);
    }
    setAssets(new Map(assets).set(path, { url, name: selection.name }));
    setIssues([]);
  }

  function download() {
    const valid = validate();
    if (!valid) return;
    const url = URL.createObjectURL(new Blob([toModule(valid)], { type: 'text/plain;charset=utf-8' }));
    assetUrls.current.add(url);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday.ts';
    document.body.append(link);
    link.click();
    link.remove();
  }

  if (config) {
    return <>
      <button className="exit-preview" type="button" onClick={() => setConfig(undefined)}><ArrowLeft size={19} /> Back to editing</button>
      <App config={config} previews={new Map([...assets].map(([key, value]) => [key, value.url]))} />
    </>;
  }

  return (
    <main className="editor">
      <p className="editor-kicker">LOVVERSE · Development preview</p>
      <h1>Make the garden yours</h1>
      <p>Edit the configuration, then choose any local files you want to preview. Preview files are held in this tab. Copy them into <code>public/</code> and replace <code>src/config/birthday.ts</code> with your export to keep the changes.</p>
      <div className="editor-grid">
        <div>
          <label htmlFor="birthday-config">Birthday configuration (JSON)</label>
          <textarea id="birthday-config" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />
          <div className="editor-actions">
            <button type="button" onClick={() => setConfig(validate())}><Eye size={18} /> Preview story</button>
            <button type="button" onClick={download}><Download size={18} /> Export birthday.ts</button>
          </div>
        </div>
        <section>
          <h2>Preview assets</h2>
          <p>Use the same path in the configuration. For example, a <code>src</code> value of <code>/images/memories/favorite.webp</code> maps to <code>public/images/memories/favorite.webp</code>.</p>
          <form onSubmit={addAsset}>
            <label htmlFor="local-file">Local asset</label>
            <input id="local-file" type="file" accept="image/*,audio/*,video/*,.vtt" onChange={(event) => {
              const file = event.target.files?.[0];
              setSelection(file);
              if (file) setPath(`/${folder(file)}/${file.name.replace(/[^a-z\d_.-]/gi, '-')}`);
            }} />
            <label htmlFor="asset-path">Path in the configuration</label>
            <input id="asset-path" value={path} onChange={(event) => setPath(event.target.value)} placeholder="/images/memories/favorite.webp" />
            <button>Add to preview</button>
          </form>
          {!!assets.size && <ul>{[...assets].map(([assetPath, file]) => <li key={assetPath}><code>{assetPath}</code> · {file.name}</li>)}</ul>}
        </section>
      </div>
      {!!issues.length && <ul role="alert" className="editor-errors">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
    </main>
  );
}
