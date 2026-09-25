'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
export function RegionPicker() {
  const [language, setLanguage] = useState('English');
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('seconda-preferences') || '{}');
      if (prefs.language) setLanguage(prefs.language);
    } catch {}
  }, []);
  return (
    <div className="region-picker">
      <label>
        <span className="sr-only">Preferred language</span>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            let prefs = {};
            try {
              prefs = JSON.parse(localStorage.getItem('seconda-preferences') || '{}');
            } catch {}
            localStorage.setItem(
              'seconda-preferences',
              JSON.stringify({ ...prefs, language: e.target.value }),
            );
            toast.success('Preference saved. Demo content remains in English.');
          }}
        >
          {['English', 'Deutsch', 'Français', 'Italiano'].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Currency</span>
        <select defaultValue="CHF">
          <option>CHF</option>
        </select>
      </label>
    </div>
  );
}
