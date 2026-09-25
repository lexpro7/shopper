'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const options = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const;

export function ThemeSwitcher({ appearance = false }: { appearance?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selected = mounted ? theme || 'system' : 'system';
  const Icon = options.find((option) => option.value === selected)?.Icon || Monitor;

  if (appearance)
    return (
      <section className="panel appearance-panel">
        <h2>Appearance</h2>
        <p>Choose your theme. System follows your device’s appearance automatically.</p>
        <fieldset className="theme-options" disabled={!mounted}>
          <legend>Theme</legend>
          {options.map(({ value, label, Icon }) => (
            <label key={value} className="theme-option">
              <input
                type="radio"
                name="appearance-theme"
                value={value}
                checked={mounted && selected === value}
                onChange={() => setTheme(value)}
              />
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <small className="muted">Saved on this device and shared across tabs.</small>
      </section>
    );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="theme-trigger"
          aria-label="Choose theme"
          title="Choose theme"
          disabled={!mounted}
        >
          <Icon size={19} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="theme-menu"
          align="end"
          sideOffset={10}
          collisionPadding={12}
        >
          <DropdownMenu.Label className="theme-menu-label">Appearance</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={selected} onValueChange={setTheme}>
            {options.map(({ value, label, Icon }) => (
              <DropdownMenu.RadioItem className="theme-menu-item" value={value} key={value}>
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
                <DropdownMenu.ItemIndicator className="theme-check">
                  <Check size={15} />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
