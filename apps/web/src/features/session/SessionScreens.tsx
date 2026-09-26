'use client';

import { useState, type FormEvent } from 'react';
import { createHouse, joinHouse, type House, type Member } from '@faxyna/data-firebase';
import { Button, Eyebrow, Icon, Input } from '@/components/ui';
import { createAccount, firebase, signIn, signInWithEmail, signOutUser } from '@/lib/firebase';
import styles from './SessionScreens.module.css';

function Frame({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Icon name="cleaning_services" size={26} color="#ffffff" />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        {children}
      </div>
    </main>
  );
}

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Confira o e-mail.',
  'auth/email-already-in-use': 'Esse e-mail já tem conta. Use "Entrar".',
  'auth/weak-password': 'A senha precisa de pelo menos 6 caracteres.',
};

/** Runs an async action with a busy flag and a friendly error. */
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      // Closing the Google popup is not an error.
      const code = (e as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user') setError(ERRORS[code] ?? 'Não deu certo. Tente de novo.');
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, run } = useAction();
  const filled = !!email.trim() && !!password;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (filled) run(() => signInWithEmail(email.trim(), password));
  };

  return (
    <Frame title="Faxyna" text="O cronograma de limpeza da casa, compartilhado com quem mora com você.">
      <Button variant="primary" size="xxl" icon="login" disabled={busy} onClick={() => run(signIn)}>
        Entrar com Google
      </Button>

      <div className={styles.divider}>ou com e-mail</div>

      <form className={styles.form} onSubmit={submit}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail" aria-label="E-mail" autoComplete="email" />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha" aria-label="Senha" autoComplete="current-password" />
        <div className={styles.twoCols}>
          <Button disabled={busy || !filled} onClick={() => run(() => createAccount(email.trim(), password))}>Criar conta</Button>
          <Button type="submit" variant="primary" disabled={busy || !filled}>Entrar</Button>
        </div>
      </form>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </Frame>
  );
}

export function HouseSetupScreen({ member, invites }: { member: Member; invites: House[] }) {
  const [name, setName] = useState(`Casa de ${member.name}`);
  const { busy, error, run } = useAction();
  const { db } = firebase();

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) run(() => createHouse(db, member, name.trim()));
  };

  return (
    <Frame
      title={`Oi, ${member.name}`}
      text={invites.length ? 'Você foi convidado para uma casa. Entre nela ou crie a sua.' : 'Crie a sua casa. Depois é só convidar quem mora com você.'}
    >
      {!member.emailVerified && <p className={styles.note}>Recebeu um convite? Convites só aparecem ao entrar com Google.</p>}
      {invites.map((h) => (
        <div key={h.id} className={styles.invite}>
          <Icon name="home" size={20} color="var(--blue)" />
          <span className={styles.inviteName}>{h.name}</span>
          <Button variant="primary" size="sm" disabled={busy} onClick={() => run(() => joinHouse(db, h.id, member))}>
            Entrar
          </Button>
        </div>
      ))}

      <form className={styles.form} onSubmit={create}>
        <Eyebrow>Nome da casa</Eyebrow>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label="Nome da casa" />
        <Button type="submit" variant={invites.length ? 'outline' : 'primary'} size="xxl" icon="add_home" disabled={busy || !name.trim()}>
          Criar casa
        </Button>
      </form>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button type="button" className={styles.link} onClick={signOutUser}>
        Entrar com outra conta ({member.email})
      </button>
    </Frame>
  );
}
