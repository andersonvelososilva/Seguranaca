# Relatório Técnico de Segurança: Camada 0 — Segurança do Cliente (Client-Side)
## Sistema de Telemedicina "MedSeguro"

**Disciplina**: Segurança da Informação  
**Curso**: Tecnologia em Análise e Desenvolvimento de Sistemas (TADS) — 5º Módulo  
**Instituição**: Instituto Federal do Piauí (IFPI)  
**Docente**: Prof. Luís Vitorino do Nascimento Júnior  
**Autores**: Anderson Veloso, Kleyvison Thomas, Maria Clara, Maria Monalisa e Raissa Alves  
**Data**: 30 de Julho de 2026  

---

## 1. Introdução e Contextualização do MedSeguro

O sistema **MedSeguro** é uma plataforma fictícia de telemedicina concebida para gerenciar prontuários médicos, laudos, receitas e informações cadastrais de pacientes. Por lidar com dados pessoais altamente sensíveis (conforme classificado pelo artigo 5º, inciso II, da Lei Geral de Proteção de Dados - LGPD), a arquitetura do sistema exige uma abordagem de **defesa em profundidade** (Defense-in-Depth). 

A primeira barreira de segurança de qualquer aplicação web reside no próprio cliente (o navegador do usuário). A **Camada 0 — Cliente** atua diretamente na interface de interação do usuário final, blindando o ecossistema do navegador contra vetores comuns de ataque que tentam roubar sessões, adulterar o tráfego ou executar códigos maliciosos no contexto da aplicação.

---

## 2. Fundamentos Teóricos e Ameaças Mitigadas

A segurança na Camada 0 baseia-se em quatro pilares fundamentais estabelecidos diretamente no protocolo HTTP e interpretados pelo agente de usuário (navegador):

### 2.1 HTTPS (HTTP Secure) e Cifragem em Trânsito
* **Ameaça**: *T1 — Interceptação de tráfego (Man-in-the-Middle - MitM)*. Em redes sem fio abertas ou infraestruturas de rede corrompidas, um atacante pode capturar os pacotes que trafegam entre o cliente e o servidor. Sem cifragem, credenciais e históricos médicos ficam expostos em texto claro.
* **Mitigação**: O HTTPS encapsula o tráfego HTTP convencional em um canal cifrado usando TLS (Transport Layer Security). Isso garante **confidencialidade** (impedindo a leitura do tráfego), **integridade** (evitando a alteração de dados no caminho) e **autenticidade** (confirmando a identidade do servidor por meio de certificados digitais).

### 2.2 HSTS (HTTP Strict Transport Security)
* **Ameaça**: *Downgrade Attacks / SSL-Stripping*. Mesmo que um site suporte HTTPS, um atacante pode interceptar a primeira requisição HTTP e forçar o navegador do usuário a continuar usando uma conexão HTTP não segura.
* **Mitigação**: O cabeçalho `Strict-Transport-Security` informa ao navegador que todas as requisições futuras àquele domínio (e opcionalmente aos seus subdomínios) devem ser feitas estritamente via HTTPS. O navegador armazena essa diretiva localmente e converte requisições `http://` para `https://` antes de qualquer dado ser transmitido pela rede.

### 2.3 CSP (Content Security Policy)
* **Ameaça**: *T3 — Cross-Site Scripting (XSS)*. Ocorre quando dados fornecidos pelo usuário ou injetados por terceiros são renderizados e interpretados pelo navegador como código executável (JavaScript inline, scripts externos não confiáveis). O atacante usa esse vetor para desviar tokens ou manipular a UI.
* **Mitigação**: A CSP é uma diretiva HTTP que define uma lista de origens confiáveis para recursos (scripts, folhas de estilo, fontes, conexões AJAX). Ao bloquear scripts inline não autorizados e forçar a execução exclusiva de fontes confiáveis, a CSP remove completamente a eficácia de ataques XSS.

### 2.4 Cookies com Atributos de Segurança (`HttpOnly`, `Secure`, `SameSite`)
* **Ameaça**: *T2 — Sequestro de Sessão (Session Hijacking)*. Se um invasor consegue ler o cookie que contém o identificador de sessão através da propriedade JavaScript `document.cookie`, ele pode replicar esse cookie em seu próprio computador e assumir a conta da vítima.
* **Mitigação**: 
  - **`HttpOnly`**: Garante que o cookie de sessão seja inacessível por scripts do lado do cliente (impedindo roubos via XSS).
  - **`Secure`**: Força o envio do cookie apenas se a requisição for HTTPS.
  - **`SameSite=Strict`**: Garante que o cookie não seja enviado em requisições de sites de terceiros, mitigando ataques de CSRF (Cross-Site Request Forgery).

---

## 3. Arquitetura da Simulação Prática

Para comprovar a eficácia das mitigações em ambiente de testes, foi desenvolvido um ecossistema simulado usando **Node.js** e **Express**:

```
 ┌───────────────────────┐             POST /api/login            ┌──────────────────────┐
 │                       │───────────────────────────────────────>│                      │
 │                       │ <  Set-Cookie: session_token           │                      │
 │                       │    (HttpOnly, Secure, SameSite)        │                      │
 │        CLIENTE        │                                        │  SERVIDOR EXPRESS    │
 │   (public/index.html) │             Ataque XSS                 │     (server.js)      │
 │                       │───────────────────────────────────────>│                      │
 │                       │   [CSP Bloqueia Script Inline]         │                      │
 │                       │───────────────────────────────────────>│                      │
 └───────────────────────┘             POST /api/csp-report       └──────────────────────┘
```

---

## 4. Detalhamento Técnico do Código Implementado

### 4.1 Lógica do Servidor (`server.js`)
O servidor Express foi projetado para operar em dois modos: **Seguro (Protegido)** e **Inseguro (Vulnerável)**. Isso permite que estudantes e auditores analisem o comportamento prático sob ambas as condições:

```javascript
app.use((req, res, next) => {
  if (securityEnabled) {
    // 1. HSTS: Força conexões HTTPS durante 1 ano e inclui subdomínios
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // 2. CSP: Define a política de segurança restringindo scripts, estilos e fontes
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; connect-src 'self'; report-uri /api/csp-report"
    );

    // 3. Cabeçalhos de Higiene Adicionais
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Evita MIME sniffing
    res.setHeader('X-Frame-Options', 'DENY');           // Impede Clickjacking
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  next();
});
```

* **Mecanismo de Login**: Ao realizar a autenticação simulada, os parâmetros do cookie de sessão mudam drasticamente de acordo com a política de segurança ativa:
```javascript
const cookieOptions = { path: '/' };
if (securityEnabled) {
  cookieOptions.httpOnly = true;  // Bloqueia leitura pelo document.cookie no JS
  cookieOptions.secure = true;    // Transmissão exclusiva por HTTPS
  cookieOptions.sameSite = 'strict';
}
res.cookie('session_token', 'MEDSEGURO_SECRET_SESSION_TOKEN_123456', cookieOptions);
```

### 4.2 Interface de Demonstração (`public/index.html`)
A interface gráfica foi desenhada usando padrões modernos de estética (dark mode, grids responsivos, fontes elegantes e micro-animações). Ela disponibiliza três módulos principais de testes:

1. **Painel de Cabeçalhos**: Mostra em tempo real os cabeçalhos de segurança retornados pelo servidor.
2. **Injetor XSS**: Campo de texto onde é possível submeter cargas úteis (*payloads*) de scripts maliciosos. A interface detecta dinamicamente se o navegador permitiu a execução ou se a CSP bloqueou.
3. **Leitor de Cookie**: Uma ferramenta para verificar se scripts locais têm acesso ao `session_token`.

---

## 5. Resultados dos Testes Práticos e Comportamento Esperado

### 5.1 Com a Segurança Desativada (Vulnerável)
* **Ataque XSS**: Ao injetar `<script>alert("XSS")</script>`, o navegador executa o script imediatamente. O alerta exibe o token de sessão, pois a propriedade `document.cookie` fica exposta.
* **Resultado de Auditoria**: Alta vulnerabilidade crítica de roubo de conta identificada.

### 5.2 Com a Segurança Ativada (Protegido)
* **Ataque XSS**: O navegador recusa-se a executar o script inline injetado no HTML. No console do desenvolvedor (F12), o navegador gera o erro de bloqueio e realiza uma requisição POST automática para a rota `/api/csp-report` do servidor contendo o JSON detalhado da violação.
* **Leitor de Cookie**: A tentativa de ler `document.cookie` retorna uma string vazia ou sem o cookie confidencial, impedindo a exfiltração do token.
* **Resultado de Auditoria**: Em conformidade com os principais padrões da OWASP e as diretrizes da LGPD para proteção de dados em nível de aplicação cliente.

---

## 6. Conclusão e Recomendações Técnicas

A correta configuração da **Camada 0 — Cliente** é o fundamento indispensável sobre o qual todas as outras camadas de segurança do MedSeguro (Autenticação, Banco de Dados e Criptografia) devem se apoiar. A simulação demonstrou de forma empírica que:

1. Apenas ter criptografia do lado do servidor não impede ataques que sequestram a sessão a partir do navegador.
2. A política de CSP restrita (`script-src 'self'`) é o mecanismo de segurança mais robusto da atualidade para eliminar ataques do tipo Cross-Site Scripting.
3. O uso consciente do atributo `HttpOnly` constitui uma blindagem essencial para a integridade de credenciais de login.
