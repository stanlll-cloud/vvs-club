import type { ReactNode } from 'react';
import { RiFolderLine, RiPlayFill, RiSearchLine } from '@remixicon/react';
import macbook from '../../../../../resources/setup/macbook.png';
import iphone from '../../../../../resources/setup/iphone.png';
import { PeachSilhouette } from './peach-silhouette';

type SceneStep = number | 'restore' | 'done';

function LibraryPreview() {
  return <div data-setup-mini-library="">
    <div data-setup-mini-toolbar=""><span /><span /><span /><RiSearchLine /></div>
    <div data-setup-mini-posters=""><div><RiPlayFill /></div><div /><div /></div>
    <div data-setup-mini-lines=""><span /><span /></div>
  </div>;
}

/** 首次设置的场景说明；使用 Peach 图标与布局，不包含真实馆藏。 */
export function SetupScene({ step }: { step: SceneStep }) {
  const title = step === 0 ? '收藏再多，也找得到。' : step === 1 ? '从一个文件夹开始。'
    : step === 2 ? '换个屏幕，继续看。' : step === 3 ? '影片空间，由你定。'
    : step === 'restore' ? '把旧收藏接回来。' : '下一部，从这里找。';
  const description = step === 0 ? 'vvs-club把分散的影片、资料和观看记录放在一起。'
    : step === 1 ? '连接现有目录，扫描时不搬动原文件。'
    : step === 2 ? '按选定的访问范围，在电脑或手机打开媒体库。'
    : step === 3 ? '保存目录与访问设置，再决定是否立即扫描。'
    : step === 'restore' ? '选择已有数据目录，保留原来的设置与记录。' : '打开媒体库，找到今天想看的那一部。';
  return <aside data-setup-scene="">
    <div data-setup-scene-brand=""><PeachSilhouette variant="brand" /><span>vvs-club</span></div>
    <div data-setup-scene-art="" key={step} aria-hidden="true">
      {step === 0 ? <PeachSilhouette variant="welcome" />
        : step === 3 || step === 'done' ? <img data-setup-original-mark="" src="/vvs-club.svg" alt="" width={148} height={148} />
        : step === 2 ? <div data-setup-devices="">
        <div data-setup-macbook=""><img src={macbook} alt="" /><div data-setup-device-screen=""><LibraryPreview /></div></div>
        <div data-setup-iphone=""><img src={iphone} alt="" /><div data-setup-device-screen=""><LibraryPreview /></div></div>
      </div> : <div data-setup-library-scene="">
        <LibraryPreview />
        <div data-setup-scene-badge=""><RiFolderLine /><span>你的媒体库</span></div>
      </div>}
    </div>
    <div data-setup-scene-caption="" key={`caption-${step}`}>
      <p className="text-title-2-medium" data-copy-key={`setup.scene.title.${step}`}>{title}</p>
      <p className="text-body-2-regular" data-copy-key={`setup.scene.description.${step}`}>{description}</p>
    </div>
  </aside>;
}

export function SetupShell({ step, children }: { step: SceneStep; children: ReactNode }) {
  return <main data-setup-page=""><div data-setup-window="" data-setup-step={step}>
    <SetupScene step={step} />{children}
  </div></main>;
}
