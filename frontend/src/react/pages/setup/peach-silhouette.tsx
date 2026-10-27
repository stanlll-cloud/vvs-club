/** vvs-club 的 V 形单色标识，保留原组件接口供首次设置使用。 */
export function PeachSilhouette({ variant }: { variant: 'brand' | 'welcome' }) {
  return <svg data-setup-mark={variant} viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M176 224h192l144 416 144-416h192L608 864H416Z" />
  </svg>;
}
