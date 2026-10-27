window.auth.onState(state => {
  document.getElementById('hint').textContent = state.message;
  for (const button of document.querySelectorAll('[data-auth]')) {
    button.hidden = button.dataset.auth === 'confirm' ? !state.cookie : state.provider !== 'baidu';
    button.disabled = !!state.busy;
  }
});
for (const button of document.querySelectorAll('[data-auth]')) button.onclick = () => window.auth.action(button.dataset.auth);
