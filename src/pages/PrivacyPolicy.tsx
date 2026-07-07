import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Voltar</button>
        <h1 className="page-title" style={{ margin: 0 }}>🔒 Política de Privacidade</h1>
      </div>

      <div className="card" style={{ padding: 24, lineHeight: 1.7, fontSize: '0.9rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Última atualização: julho de 2026
        </p>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>1. Introdução</h2>
          <p>
            O Baby Tracker é um aplicativo PWA de acompanhamento de bebês. Esta política explica quais dados
            coletamos, como são armazenados, usados e compartilhados, e quais são os seus direitos.
          </p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>2. Dados Coletados</h2>
          <p>O aplicativo coleta e armazena os seguintes dados informados voluntariamente pelo usuário:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Dados do bebê:</strong> nome, data de nascimento, foto, nomes dos pais.</li>
            <li><strong>Registros de rotina:</strong> mamadas, fraldas, sono, atividades, crescimento (peso, altura, PC), vacinas, medicamentos, febre, consultas médicas e diário.</li>
            <li><strong>Dados da conta:</strong> email e senha (apenas se o usuário criar conta no Supabase para sincronização).</li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>3. Armazenamento</h2>
          <p>O aplicativo opera em dois modos:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Modo local (padrão):</strong> Os dados ficam armazenados exclusivamente no
              <code>localStorage</code> do navegador do dispositivo. Nenhum dado é enviado para servidores 
              externos, mesmo com o Supabase configurado. A exclusão ocorre ao limpar o cache do navegador ou desinstalar o PWA.
            </li>
            <li>
              <strong>Modo sincronizado (automático ao logar):</strong> Se o usuário criar uma conta e estiver
              logado, o aplicativo realiza a sincronização automática dos dados com o banco de dados Supabase
              em segundo plano. Isso inclui envio (<em>push</em>) e recebimento (<em>pull</em>) periódico de
              dados, além de atualizações em tempo real via subscription. A sincronização permite que os dados
              fiquem disponíveis em múltiplos dispositivos e possam ser compartilhados com cuidadores
              autorizados. O usuário pode deslogar a qualquer momento para interromper a sincronização.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>4. Finalidade do Tratamento</h2>
          <p>Os dados são utilizados exclusivamente para:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Exibir o histórico e gráficos de crescimento do bebê.</li>
            <li>Gerar relatórios em PDF, CSV e backup JSON.</li>
            <li>Sincronizar dados entre dispositivos do mesmo usuário (quando ativado).</li>
            <li>Compartilhar dados com cuidadores autorizados pelo usuário (quando ativado).</li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>5. Compartilhamento de Dados</h2>
          <p>
            O Baby Tracker <strong>não vende, aluga ou compartilha</strong> dados pessoais com terceiros para
            fins comerciais ou publicitários. O único compartilhamento possível é o <strong>compartilhamento
              intencional</strong> entre cuidadores, feito pelo próprio usuário através da funcionalidade de
            convite no aplicativo.
          </p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>6. Serviços de Terceiros</h2>
          <p>O aplicativo utiliza os seguintes serviços de terceiros (apenas se configurado pelo usuário):</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Supabase</strong> — plataforma de backend open-source que fornece autenticação, banco de
              dados PostgreSQL e storage de arquivos. Os dados armazenados no Supabase seguem a política de
              privacidade da Supabase (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>).
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>7. Retenção e Exclusão</h2>
          <p>
            Os dados permanecem armazenados até que o usuário os exclua ativamente. O usuário pode:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Remover registros individuais a qualquer momento.</li>
            <li>Remover um bebê e todos os seus registros.</li>
            <li>Exportar os dados em formato JSON (backup) antes da exclusão.</li>
            <li>Excluir a conta no Supabase, que remove todos os dados sincronizados.</li>
            <li>Limpar o <code>localStorage</code> do navegador para apagar os dados locais.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>8. Direitos do Usuário (LGPD)</h2>
          <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), o usuário tem direito a:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Confirmar a existência de tratamento de dados.</li>
            <li>Acessar os dados pessoais tratados.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
            <li>Solicitar a portabilidade dos dados.</li>
            <li>Eliminar os dados tratados com consentimento.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>9. Fotos</h2>
          <p>
            As fotos dos bebês são armazenadas localmente no navegador (via IndexedDB) e, se a sincronização
            estiver ativada, também no storage do Supabase. O usuário pode excluir a foto a qualquer momento.
            Recomenda-se não utilizar fotos que permitam identificação externa desnecessária.
          </p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>10. Segurança</h2>
          <p>
            O aplicativo adota boas práticas de segurança:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Comunicação criptografada via HTTPS.</li>
            <li>Autenticação segura via Supabase Auth (quando ativada).</li>
            <li>Nenhum dado é transmitido sem consentimento explícito do usuário.</li>
            <li>Não há coleta de analytics, tracking ou cookies de terceiros.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>11. Responsabilidade</h2>
          <p>
            O Baby Tracker é fornecido como uma ferramenta de auxílio ao acompanhamento do bebê. 
            Ele <strong>não substitui</strong> consultas médicas, orientação profissional ou qualquer autoridade
            de saúde. O usuário é o único responsável pela precisão e uso dos dados inseridos.
          </p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--lilac-900)', marginBottom: 8 }}>12. Contato</h2>
          <p>
            Para questões relacionadas a esta política de privacidade ou para exercer seus direitos, entre em
            contato através do repositório do projeto no GitHub:
            <br />
            <a href="https://github.com/leooliveiraz/baby-tracker" target="_blank" rel="noopener noreferrer">
              github.com/leooliveiraz/baby-tracker
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
