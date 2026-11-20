import { useId, useState } from 'react';
import { Settings2, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../app/providers/AudioProvider';
import { Dialog } from './Dialog';

export function MusicToggle({ compact = false }: { compact?: boolean }) {
  const { activeTrack, enabled, toggle } = useAudio();
  const Icon = enabled ? Volume2 : VolumeX;
  return (
    <button type="button" className={`music-toggle ${compact ? '' : 'button ghost'}`} disabled={!activeTrack}
      aria-pressed={enabled} onClick={toggle} title={activeTrack ? undefined : 'No music configured'}>
      <Icon size={17} strokeWidth={1.6} />
      <span>{!activeTrack ? 'No music' : enabled ? 'Music on' : 'Music off'}</span>
    </button>
  );
}

export function MusicControls() {
  const [settings, setSettings] = useState(false);
  const volumeId = useId();
  const { activeTrack, tracks, volume, setVolume, select, error } = useAudio();
  return (
    <div className="music-controls">
      <MusicToggle compact />
      {activeTrack && <button type="button" className="music-settings" aria-label="Music settings" onClick={() => setSettings(true)}><Settings2 size={17} strokeWidth={1.6} /></button>}
      {error && <span className="music-error" role="status">{error}</span>}
      {settings && (
        <Dialog title="Music settings" onClose={() => setSettings(false)}>
          <div className="media-settings">
            <MusicToggle />
            <label>Track<select value={activeTrack?.id ?? ''} onChange={(event) => select(event.target.value)}>{tracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select></label>
            <div className="volume-setting">
              <label htmlFor={volumeId}>Volume</label><span aria-hidden="true">{Math.round(volume * 100)}%</span>
              <input id={volumeId} type="range" min="0" max="1" step=".01" value={volume} aria-valuetext={`${Math.round(volume * 100)}%`}
                onChange={(event) => setVolume(Number(event.target.value))} />
            </div>
            {error && <p className="status" role="status">{error}</p>}
          </div>
        </Dialog>
      )}
    </div>
  );
}
