/* 首次运行页：取题目、画表单，成功后在同一页换成完成态。
 *
 * 题目接口只对运行 Peach 的这台电脑开放；别的设备打开时它回 403，页面不画表单，只说去哪里打开。 */
import { useEffect, useState } from 'react';

import { Button } from '@/components/base/buttons/button';

import { Note } from '../../components/note';
import { describeFailure, fetchQuestions, SetupRequestError, type SetupDone, type SetupQuestions } from './setup-api';
import { SetupDoneView } from './setup-done';
import { SetupForm } from './setup-form';
import { SetupRestore } from './setup-restore';
import { SetupShell } from './setup-scene';

type View =
  | { kind: 'loading' }
  | { kind: 'denied' }
  | { kind: 'failed'; message: string }
  | { kind: 'form'; setup: SetupQuestions }
  | { kind: 'done'; done: SetupDone };

export function SetupPage() {
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestions(controller.signal).then(
      (setup) => setView({ kind: 'form', setup }),
      (cause: unknown) => {
        if (controller.signal.aborted) return;
        setView(cause instanceof SetupRequestError && cause.status === 403
          ? { kind: 'denied' }
          : { kind: 'failed', message: describeFailure(cause) });
      });
    return () => controller.abort();
  }, [attempt]);

  if (view.kind === 'done') return <SetupDoneView done={view.done} />;
  const retry = () => {
    setView({ kind: 'loading' });
    setAttempt((count) => count + 1);
  };
  if (view.kind === 'form' && !restoring) return <SetupForm setup={view.setup}
    onRestore={() => setRestoring(true)} onDone={(done) => setView({ kind: 'done', done })} />;
  if (view.kind === 'form') return <SetupRestore onBack={() => setRestoring(false)}
    onDone={(done) => setView({ kind: 'done', done })} />;
  return (
    <SetupShell step={0}>
    <section data-setup-form-panel="" aria-labelledby="auth-card-title" aria-busy={view.kind === 'loading' || undefined}>
      <div data-setup-top=""><span className="text-body-2-regular text-text-secondary">首次设置</span></div>
      <div data-setup-step-scroll=""><div data-setup-step-content="">
      <header data-setup-step-heading="">
        <h1 id="auth-card-title" className="text-title-1-semibold text-text-primary">把收藏安放在vvs-club</h1>
        <p className="text-body-regular text-text-secondary">先连接媒体目录，再选择访问方式。</p>
      </header>
      {view.kind === 'loading' ? <div data-setup-loading="" data-skeleton="" role="status" aria-label="正在读取设置"><span /><span /><span /></div> : null}
      {view.kind === 'denied' ? <Note tone="error">请在运行 Peach 的这台电脑上打开设置。</Note> : null}
      {view.kind === 'failed'
        ? <Note tone="error" action={<Button variant="secondary" onClick={retry}>立即重试</Button>}>{view.message}</Note>
        : null}
      </div></div>
    </section>
    </SetupShell>
  );
}
