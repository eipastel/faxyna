'use client';

import { useState, type FormEvent } from 'react';
import { cancelInvite, inviteToHouse, leaveHouse, moveToHouse, toPeople, type House } from '@faxyna/data-firebase';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, Card, DashedNote, Icon, IconButton, Input, SectionHeader } from '@/components/ui';
import { firebase } from '@/lib/firebase';
import { useData } from '@/providers/DataProvider';
import { useSession } from '@/providers/SessionProvider';
import { useToast } from '@/providers/ToastProvider';
import styles from './HouseView.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Other houses (invites, or a move that did not finish), members, invite by email and sign out. */
export function HouseView() {
  const { house, invites, otherHouses, member, signOut } = useSession();
  const { people } = useData();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
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

  // Invites and houses you are already in, both reached by leaving this one.
  const others = [...otherHouses.map((h) => ({ h, invited: false })), ...invites.map((h) => ({ h, invited: true }))];

  // First tap asks for confirmation, since the current house is left (or deleted).
  const moveTo = (to: House, invited: boolean) => {
    if (confirming !== to.id) return setConfirming(to.id);
    setConfirming(null);
    const write = invited ? moveToHouse(db, house.id, to.id, member) : leaveHouse(db, house.id, member);
    save(write, `Agora você está em ${to.name}.`);
  };
  const leaveWarning = house.memberUids.length > 1
    ? `Você sai de ${house.name}.`
    : `${house.name} e as tarefas dela serão apagadas.`;

  return (
    <>
      <PageHeader title="Casa" subtitle={house.name} />
      <PageContent>
        {others.length > 0 && (
          <section className={styles.section}>
            <SectionHeader title="Outras casas" meta={String(others.length)} />
            <Card list>
              {others.map(({ h, invited }) => (
                <div key={h.id} className={styles.row}>
                  <Icon name={invited ? 'mail' : 'home'} size={20} color="var(--blue)" />
                  <span className={styles.stacked}>
                    <span className={styles.name}>{h.name}</span>
                    <span className={styles.sub}>
                      {(invited ? 'Convite · ' : '') + toPeople(h).map((p) => p.name).join(' & ')}
                    </span>
                  </span>
                  <Button
                    variant={confirming === h.id ? 'danger' : 'primary'}
                    size="sm"
                    confirming={confirming === h.id}
                    onClick={() => moveTo(h, invited)}
                  >
                    {confirming === h.id ? 'Confirmar' : 'Entrar'}
                  </Button>
                </div>
              ))}
            </Card>
            <p className={styles.hint}>
              {confirming ? leaveWarning : 'Ao entrar em outra casa, você sai desta.'}
            </p>
          </section>
        )}

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
