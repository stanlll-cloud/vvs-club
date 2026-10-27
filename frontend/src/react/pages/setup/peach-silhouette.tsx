/** vvs-club 的 V 与播放键标识，供首次设置使用。 */
export function PeachSilhouette({ variant }: { variant: 'brand' | 'welcome' }) {
  return <img data-setup-mark={variant} src="/vvs-club.svg" alt="vvs-club" width={variant === 'brand' ? 28 : 148} height={variant === 'brand' ? 28 : 148} />;
}
