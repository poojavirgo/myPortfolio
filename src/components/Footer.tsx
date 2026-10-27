import { useEffect, useState, type ChangeEvent } from 'react';
import { profile } from '../data/content';
import { AVATAR_URL } from '../data/tour';
import { loadAvatarFile, loadAvatarUrl } from '../three/loadAvatar';

const HINT = 'Rigged .glb with clips named idle, walk, wave, talk, sit_typing';

export default function Footer() {
  const [status, setStatus] = useState(HINT);

  useEffect(() => {
    if (!AVATAR_URL) return;
    loadAvatarUrl(AVATAR_URL).catch(() => setStatus(`Could not load ${AVATAR_URL}`));
  }, []);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Loading…');
    try {
      const clips = await loadAvatarFile(file);
      setStatus(`Avatar loaded. Clips found: ${clips.join(', ') || 'none'}`);
    } catch {
      setStatus('That file is not a valid .glb. Export again as glTF Binary.');
    }
  };

  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {profile.name} · {profile.location.split(',')[0]}</span>
      {/* Avatar test tool: remove once your own avatar is set in AVATAR_URL */}
      <div className="loader">
        <label htmlFor="glb">Load your avatar (.glb)<input type="file" id="glb" accept=".glb" onChange={onFile} /></label>
        <span className="glb-status">{status}</span>
      </div>
    </footer>
  );
}
