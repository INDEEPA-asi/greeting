import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { AudioProvider } from '../app/providers/AudioProvider';
import LoveLetter from '../chapters/LoveLetter';
import MemoryGarden from '../chapters/MemoryGarden';
import StoryTimeline from '../chapters/StoryTimeline';
import { Dialog } from '../components/ui/Dialog';
import { GardenImage } from '../components/ui/GardenImage';
import { MusicControls } from '../components/ui/MusicControls';
import { gardenConfig } from '../config/birthday';

describe('accessible controls', () => {
  it('opens a dialog, focuses its close button, and restores focus on Escape', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return <><button type="button" onClick={() => setOpen(true)}>Show dialog</button>
        {open && <Dialog title="A note" onClose={() => setOpen(false)}><p>Hello.</p></Dialog>}</>;
    }
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Show dialog' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'A note' });
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('opens, skips, closes and reopens a complete letter', async () => {
    const user = userEvent.setup();
    render(<LoveLetter config={gardenConfig} reduced={false} />);
    await user.click(screen.getByRole('button', { name: 'Open My Letter' }));
    const article = screen.getByRole('article', { name: 'Birthday letter' });
    expect(article).toHaveClass('revealing');
    await user.click(screen.getByRole('button', { name: 'Skip reveal' }));
    expect(article).not.toHaveClass('revealing');
    expect(screen.getByText(gardenConfig.letter.at(-1)!)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close letter' }));
    expect(screen.queryByRole('article')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open My Letter' }));
    expect(screen.getByRole('article')).toBeVisible();
  });

  it('only plays music after a deliberate action and exposes volume and track settings', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    render(<AudioProvider {...gardenConfig.audio}><MusicControls /></AudioProvider>);
    const toggle = screen.getByRole('button', { name: 'Music off' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(play).not.toHaveBeenCalled();
    await user.click(toggle);
    expect(play).toHaveBeenCalledOnce();
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Music settings' }));
    expect(screen.getByRole('slider', { name: /volume/i })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Track' })).toHaveValue('rose-garden');
  });

  it('explains unavailable music and disables its toggle', () => {
    render(<AudioProvider tracks={[]}><MusicControls /></AudioProvider>);
    expect(screen.getByRole('button', { name: 'No music' })).toBeDisabled();
    expect(screen.getByText('No music')).toBeVisible();
  });

  it('puts focus on the new chapter heading after skipping the intro', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Skip intro' }));
    const heading = await screen.findByRole('heading', { name: 'Happy Birthday, My Love' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Blow Out the Candles' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('navigates through photos with arrow keys from anywhere in the dialog', async () => {
    const user = userEvent.setup();
    render(<MemoryGarden config={gardenConfig} />);
    const first = screen.getByRole('button', { name: /A handful of roses/ });
    await user.click(first);
    expect(screen.getByRole('dialog', { name: 'Memory viewer' })).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 3 · Demo photograph')).toBeVisible();
    expect(screen.getAllByRole('img', { name: gardenConfig.photos[1].alt }).length).toBeGreaterThan(1);
    await user.keyboard('{ArrowLeft}');
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(first).toHaveFocus();
  });
});

describe('empty and missing content', () => {
  it('renders scrapbook and timeline empty states', () => {
    const config = { ...gardenConfig, photos: [], timeline: [] };
    const view = render(<MemoryGarden config={config} />);
    expect(screen.getByText(/Demo card/)).toBeVisible();
    view.rerender(<StoryTimeline config={config} />);
    expect(screen.getByText(/waiting for its first memory/)).toBeVisible();
  });

  it('replaces a failed photo and retains layout', () => {
    render(<GardenImage photo={{ src: '/images/example.webp', alt: 'A favorite rose' }} />);
    fireEvent.error(screen.getByRole('img', { name: 'A favorite rose' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Photograph unavailable')).toBeVisible();
  });
});
