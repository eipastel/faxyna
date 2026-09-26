'use client';

import { useState, type FormEvent } from 'react';
import { cancelInvite, inviteToHouse } from '@faxyna/data-firebase';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, Card, DashedNote, Icon, IconButton, Input, SectionHeader } from '@/components/ui';
import { firebase } from '@/lib/firebase';
import { useData } from '@/providers/DataProvider';
import { useSession } from '@/providers/SessionProvider';
import { useToast } from '@/providers/ToastProvider';
import styles from './HouseView.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** House members, pending invites, invite by email and sign out. */
export function HouseView() {
  const { house, member, signOut } = useSession();
  const { people } = useData();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const { db } = firebase();

  const save = async (write: Promise<void>, message: string) => {
    try {
      await write;
      showToast(message);
    } catch {
      showToast('Não foi possível salvar. Tente de novo.', { error: true });
    }
  };

  const invite = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value)) return showToast('Confira o e-mail.', { error: true });
    setEmail('');
    save(inviteToHouse(db, house.id, value), 'Convite enviado. É só a pessoa entrar com esse e-mail.');
  };

  return (
    <>
      <PageHeader title="Casa" subtitle={house.name} />
      <PageContent>
        <section className={styles.section}>
          <SectionHeader title="Moradores" meta={String(people.length)} />
          <Card list>
            {people.map((p) => (
              <div key={p.id} className={styles.row}>
                <Avatar name={p.name} size="md" />
                <span className={styles.name}>{p.name}</span>
                {p.id === member.uid && <span className={styles.meta}>você</span>}
              </div>
            ))}
          </Card>
        </section>

        <section className={styles.section}>
          <SectionHeader title="Convidar" />
          <form className={styles.inviteForm} onSubmit={invite}>
            <Input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              aria-label="E-mail de quem vai entrar"
              autoComplete="off"
            />
            <Button type="submit" variant="primary" size="xxl" disabled={!email.trim()}>Convidar</Button>
          </form>
          <p className={styles.hint}>A pessoa entra com a conta Google desse e-mail e aceita o convite.</p>
          {house.invites.length > 0 ? (
            <Card list>
              {house.invites.map((e) => (
                <div key={e} className={styles.row}>
                  <Icon name="schedule_send" size={20} color="var(--text-3)" />
                  <span className={styles.name}>{e}</span>
                  <IconButton icon="close" iconSize={18} label={`Cancelar convite de ${e}`} onClick={() => save(cancelInvite(db, house.id, e), 'Convite cancelado.')} />
                </div>
              ))}
            </Card>
          ) : (
            <DashedNote>Nenhum convite pendente.</DashedNote>
          )}
        </section>

        <section className={styles.section}>
          <SectionHeader title="Conta" />
          <Card list>
            <div className={styles.row}>
              <Icon name="account_circle" size={22} color="var(--text-3)" />
              <span className={styles.name}>{member.email}</span>
            </div>
          </Card>
          <Button icon="logout" iconSize={18} onClick={signOut}>Sair da conta</Button>
        </section>
      </PageContent>
    </>
  );
}
