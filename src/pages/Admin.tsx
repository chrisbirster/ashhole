import { createSignal } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { s } from '../styles/site.stylex';

export default function Admin() {
  const [token, setToken] = createSignal(localStorage.getItem('ashhole-admin-token') || '');
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [title, setTitle] = createSignal(`${new Date().getFullYear()} ASHHOLE Classic`);
  const [status, setStatus] = createSignal('Planning');
  const [message, setMessage] = createSignal('');

  async function save(event: SubmitEvent) {
    event.preventDefault();
    localStorage.setItem('ashhole-admin-token', token());
    const response = await fetch(`/api/admin/events/${year()}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token()}` },
      body: JSON.stringify({ title: title(), status: status() }),
    });
    setMessage(response.ok ? 'Event saved.' : `Save failed (${response.status}).`);
  }

  return <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}><div {...stylex.attrs(s.eyebrow)}>Protected workspace</div><h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">ADMIN</h1><div {...stylex.attrs(s.notice)}>The token is never committed or bundled. This UI stores it only in this browser. The server still performs the authorization check on every write.</div><form {...stylex.attrs(s.form)} onSubmit={save}>
    <label {...stylex.attrs(s.label)}>Admin token<input {...stylex.attrs(s.input)} type="password" value={token()} onInput={(e) => setToken(e.currentTarget.value)} /></label>
    <label {...stylex.attrs(s.label)}>Year<input {...stylex.attrs(s.input)} type="number" value={year()} onInput={(e) => setYear(Number(e.currentTarget.value))} /></label>
    <label {...stylex.attrs(s.label)}>Title<input {...stylex.attrs(s.input)} value={title()} onInput={(e) => setTitle(e.currentTarget.value)} /></label>
    <label {...stylex.attrs(s.label)}>Status<input {...stylex.attrs(s.input)} value={status()} onInput={(e) => setStatus(e.currentTarget.value)} /></label>
    <button {...stylex.attrs(s.button)} type="submit">Save event</button><p>{message()}</p>
  </form></div></section>;
}
