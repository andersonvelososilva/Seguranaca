# Relatório de Implementação: Camada 0 — Cliente
## Sistema de Telemedicina "MedSeguro"
**Disciplina**: Segurança da Informação  
**Aluno/Desenvolvedor**: Anderson Veloso Silva  
**Data**: 30 de Julho de 2026  

---

## 1. Introdução e Objetivo

Este relatório documenta a simulação e implementação prática da **Camada 0 — Cliente** na arquitetura do sistema **MedSeguro**. O foco principal desta camada é assegurar a integridade da comunicação, mitigar ataques baseados em injeção de scripts no navegador do cliente (XSS) e blindar tokens de sessão contra sequestro de sessão (*Session Hijacking*).

---

## 2. Ameaças Abordadas

| Ameaça | Vetor de Ataque | Mitigação Aplicada |
|---|---|---|
| **T1 — Interceptação de Tráfego** | Pacotes trafegando em texto claro capturados em redes wi-fi inseguras. | **HTTPS Obrigatório** e **HSTS** (Strict-Transport-Security). |
| **T2 — Roubo de Sessão (Session Hijacking)** | Script malicioso lê `document.cookie` e envia o token de sessão para o servidor do atacante. | Atributo **`HttpOnly`** nos Cookies de Sessão. |
| **T3 — XSS (Cross-Site Scripting)** | Injeção de códigos Javascript maliciosos (`<script>` inline) na interface do usuário. | **CSP (Content Security Policy)** restritiva. |

---

## 3. Detalhes da Implementação

### 3.1 HTTPS Obrigatório & HSTS
A aplicação intercepta conexões inseguras (HTTP) e realiza o redirecionamento imediato para HTTPS (`301 Redirect`). Além disso, envia o cabeçalho `Strict-Transport-Security` (HSTS):

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
* **Efeito**: Obriga o navegador a enviar requisições apenas por HTTPS durante 1 ano (31.536.000 segundos), inclusive para subdomínios, prevenindo ataques de downgrade (*SSL-Stripping*).

### 3.2 Content Security Policy (CSP)
Para mitigar XSS de forma eficiente, configuramos uma política que restringe a origem de scripts apenas para arquivos locais da mesma origem (`'self'`), rejeitando scripts inline e avaliações dinâmicas (`eval`):

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; connect-src 'self'; report-uri /api/csp-report
```
* **`report-uri /api/csp-report`**: Rota no servidor configurada para escutar e registrar tentativas de violação da política do CSP enviadas pelos navegadores em tempo real.

### 3.3 Cookies de Sessão Seguros
O token de sessão é armazenado em cookies configurados com os atributos:
* **`HttpOnly`**: Bloqueia o acesso ao valor do cookie através da propriedade `document.cookie` no JavaScript cliente.
* **`Secure`**: Garante que o cookie seja transmitido apenas sobre conexões cifradas (HTTPS).
* **`SameSite=Strict`**: Protege contra ataques de falsificação de requisição cross-site (CSRF).

---

## 4. Instruções de Execução da Simulação

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Acesse a interface em seu navegador: `http://localhost:3000`

### Cenário de Teste:
1. **Com a Segurança Ativada**:
   * Tente efetuar o login e depois clique em *"Tentar Roubo via document.cookie"*. Você verá que o cookie não é acessível pelo JavaScript do navegador.
   * Clique em *"Executar Ataque XSS"*. O navegador bloqueará a execução do script inline e enviará um relatório de violação ao console em tempo real.
2. **Desative a Segurança**:
   * O ataque de XSS agora será bem-sucedido e exibirá um alerta na tela, além de expor o token de sessão secreto.

---

## 5. Checklist de Verificação

- [x] Redirecionamento HTTP para HTTPS simulado na lógica da aplicação.
- [x] Cabeçalho HSTS ativo com tempo de expiração seguro.
- [x] Cabeçalho CSP ativo bloqueando scripts inline não autorizados.
- [x] Envio automático de relatórios de violação do CSP para `/api/csp-report`.
- [x] Atributo `HttpOnly` implementado e verificado nos cookies de sessão.
