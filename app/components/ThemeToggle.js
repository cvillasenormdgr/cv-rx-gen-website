'use client';

import { Menu } from '@base-ui/react/menu';
import { Check, Monitor, Moon, Sun } from 'lucide-react';

import useTheme from '@/app/hooks/useTheme';
import { Button } from '@/components/ui/button';

const themeOptions = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const TriggerIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <TriggerIcon aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="z-50 min-w-[10rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            {themeOptions.map(({ value, label, Icon }) => {
              const isActive = theme === value;
              return (
                <Menu.Item
                  key={value}
                  className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  onClick={() => setTheme(value)}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {isActive ? <Check className="size-4" aria-hidden="true" /> : null}
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};

export default ThemeToggle;
