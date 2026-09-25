'use client';

import { useEffect, useState } from 'react';
import { Button, Icon, IconButton, Sheet } from '@/components/ui';
import styles from './InstallCard.module.css';

const DISMISSED_KEY = 'faxyna:install-dismissed';

// Chromium-only event, not in the TS DOM lib.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac; the touch check tells them apart.
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

/**
 * "Install the app" popup floating at the top of the screen. Android/desktop Chromium get the native prompt;
 * iOS has no install API, so it opens a sheet with the Share > Add to Home Screen steps.
 */
export function InstallCard() {
  const [mode, setMode] = useState<'prompt' | 'ios' | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {}
    if (dismissed || isStandalone()) return;
    if (isIos()) setMode('ios');

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode('prompt');
    };
    const onInstalled = () => setMode(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
    setMode(null);
  };

  const install = async () => {
    if (mode === 'ios') return setShowSteps(true);
    if (!deferred) return;
    // The event can only be used once; Chrome fires a fresh one later if still installable.
    setDeferred(null);
    try {
      await deferred.prompt();
      if ((await deferred.userChoice).outcome === 'accepted') setMode(null);
    } catch {}
  };

  return (
    <>
      <div role="dialog" aria-label="Instalar o Faxyna" className={styles.card}>
        <div className={styles.logo}>
          <Icon name="install_mobile" size={20} color="#ffffff" />
        </div>
        <div className={styles.text}>
          <span className={styles.title}>Instale o Faxyna</span>
          <span className={styles.sub}>Tela cheia e funciona sem internet.</span>
        </div>
        <Button variant="primary" size="sm" onClick={install} disabled={mode === 'prompt' && !deferred}>
          Instalar
        </Button>
        <IconButton icon="close" iconSize={18} label="Agora não" onClick={dismiss} className={styles.close} />
        {/* Countdown: hides the popup for this visit only (the close button is what remembers). */}
        <div className={styles.timer} onAnimationEnd={() => setMode(null)} />
      </div>

      <Sheet open={showSteps} onClose={() => setShowSteps(false)} label="Como instalar no iPhone">
        <div className={styles.steps}>
          <div className={styles.stepsHead}>
            <h2 className={styles.stepsTitle}>Instalar no iPhone</h2>
            <IconButton icon="close" label="Fechar" onClick={() => setShowSteps(false)} />
          </div>
          <ol className={styles.list}>
            <li>
              <span className={styles.num}>1</span>
              <span>
                Toque em <b>Compartilhar</b> <Icon name="ios_share" size={18} className={styles.inline} /> na barra do Safari.
              </span>
            </li>
            <li>
              <span className={styles.num}>2</span>
              <span>
                Role e escolha <b>Adicionar à Tela de Início</b> <Icon name="add_box" size={18} className={styles.inline} />.
              </span>
            </li>
            <li>
              <span className={styles.num}>3</span>
              <span>
                Toque em <b>Adicionar</b>. O Faxyna aparece na tela inicial como um app.
              </span>
            </li>
          </ol>
          <p className={styles.hint}>Não achou a opção? Abra este site no Safari e tente de novo.</p>
          <Button variant="primary" size="xxl" onClick={() => setShowSteps(false)}>
            Entendi
          </Button>
        </div>
      </Sheet>
    </>
  );
}
