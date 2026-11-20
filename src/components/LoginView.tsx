/* Halaman masuk ASN (satu-satunya peran aktif pada prototipe MVP, tanpa login atasan atau admin) */

import { FormEvent, useRef, useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { APP_INFO, DEMO_ACCOUNTS_METADATA } from '../config';

interface LoginViewProps {
  onLogin: (identifier: string, password: string) => string | null;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [identifier, setIdentifier] = useState(
    DEMO_ACCOUNTS_METADATA[0].email
  );
  const [password, setPassword] = useState(
    DEMO_ACCOUNTS_METADATA[0].demo_password
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const identifierRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = onLogin(identifier, password);
    if (err) {
      setErrorMsg(err);
      identifierRef.current?.focus();
    } else {
      setErrorMsg(null);
    }
  }

  function fillDemoAccount(index: number) {
    const account = DEMO_ACCOUNTS_METADATA[index];
    if (!account) return;
    setIdentifier(account.email);
    setPassword(account.demo_password);
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {APP_INFO.name}
          </h1>
          <p className="text-sm text-neutral-600">{APP_INFO.tagline}</p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Masuk Akun ASN
            </h2>
            <p className="text-sm text-neutral-600">
              Gunakan akun ASN Anda untuk mencatat aktivitas dan menyusun draft laporan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login-identifier"
                className="block text-sm font-medium text-neutral-900"
              >
                Email Dinas atau NIP
              </label>
              <input
                ref={identifierRef}
                id="login-identifier"
                name="username"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contoh: rizky.pratama@instansi.go.id"
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-neutral-900"
              >
                Kata Sandi Demo
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi demo"
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              />
            </div>

            {errorMsg ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {errorMsg}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Masuk sebagai ASN</span>
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <p className="text-sm font-medium text-neutral-900">
              Pilih Akun Demo ASN (Data Terisolasi)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS_METADATA.map((acc, idx) => {
                const selected = identifier.trim().toLowerCase() === acc.email;
                return (
                  <button
                    key={acc.user_id}
                    type="button"
                    onClick={() => fillDemoAccount(idx)}
                    className={`min-h-[44px] text-left rounded-xl border px-3.5 py-2.5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      selected
                        ? 'border-blue-700 bg-blue-50'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <p className="text-sm font-medium text-neutral-900">
                      {acc.full_name}
                    </p>
                    <p className="text-xs text-neutral-600 tabular-nums">
                      {acc.job_title} · NIP {acc.nip}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-blue-700 mt-0.5"
              aria-hidden="true"
            />
            <p>
              Pada tahap prototipe ini, akses hanya tersedia untuk peran ASN. Data tersimpan lokal di browser dan terisolasi per akun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
