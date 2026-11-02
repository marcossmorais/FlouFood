import type { Metadata } from 'next';
import Script from 'next/script';
import { Poppins, Inter } from 'next/font/google';
import './base.css';

// next/font faz self-host: as fontes deixam de vir do Google Fonts, o que
// tira um host externo da CSP e remove o flash de fonte na primeira carga.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--fonte-titulo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-corpo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlouFood — Cardápio digital pro seu negócio',
  description:
    'FlouFood — cardápio digital, pedidos pelo WhatsApp e painel de gestão pra lanchonetes, hamburguerias, pizzarias e açaiterias.',
};

/**
 * Tema da área interna, resolvido antes da primeira pintura (sem flash).
 *
 * Mora aqui, e não no layout de `(interno)`, porque um `<script>` renderizado
 * pelo React dispara "Encountered a script tag while rendering React
 * component" em toda navegação client-side — era um dos erros de console do
 * /entrar. O `beforeInteractive` do next/script só existe no layout raiz e é
 * injetado pelo Next fora da árvore do React.
 *
 * Só age nas rotas internas (o dark.css nem é carregado fora delas). Rotas
 * de autenticação são sempre claras. Na navegação client-side quem recalcula
 * é o `AplicaTema`, com a mesma regra.
 */
const SCRIPT_TEMA = `
try {
  var p = location.pathname;
  if (/^\\/(painel|superadmin|criar-loja|entrar)(\\/|$)/.test(p)) {
    var ehAuth = /^\\/entrar(\\/|$)/.test(p);
    var temaSalvo = localStorage.getItem('cf_admin_theme');
    var tema = ehAuth ? 'light' : (temaSalvo === 'dark' || temaSalvo === 'light'
      ? temaSalvo
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    document.documentElement.dataset.adminTheme = tema;
  }
} catch (_) {
  document.documentElement.dataset.adminTheme = 'light';
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script de tema grava `data-admin-theme` no
    // <html> antes da hidratação, então o atributo existe no DOM e não nas
    // props — o React acusava hydration mismatch. Só vale pros atributos
    // deste elemento, não desliga a checagem dos filhos.
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script id="tema-admin" strategy="beforeInteractive">
          {SCRIPT_TEMA}
        </Script>
        {children}
      </body>
    </html>
  );
}
