# OFICINA PRÁTICA: CRIPTOGRAFIA APLICADA EM ARQUITETURAS MODERNAS
## Do primitivo à produção — construindo um sistema real, camada por camada

> **Disciplina**: Segurança da Informação — Eixo 4 (componente prático)
> **Curso**: Tecnologia em Análise e Desenvolvimento de Sistemas (TADS) — 5º Módulo
> **Instituição**: Instituto Federal do Piauí (IFPI)
> **Docente responsável**: Prof. Luís Vitorino do Nascimento Júnior
> **Stack**: Node.js (LTS) / JavaScript · Docker · HashiCorp Vault
> **Formato**: Módulo estendido — 4 semanas × 3 encontros = 12 encontros (~24h)
> **Regime**: Laboratório guiado com construção incremental de um sistema único

---

## PARTE A — PERFIL ESPECIALIZADO DO CONDUTOR DA OFICINA

Antes do conteúdo, define-se o perfil de competências que o(a) docente (ou monitor(a)) precisa mobilizar para conduzir esta oficina com autoridade técnica. O perfil também serve como norte do que os alunos devem, ao final, ser capazes de reconhecer em um profissional da área.

### A.1 Designação do perfil

**Engenheiro(a) de Segurança Aplicada com ênfase em Criptografia de Sistemas** — perfil que combina três domínios que raramente convivem na mesma pessoa em formação inicial, e cuja integração é justamente o diferencial da oficina:

1. **Fundamento criptográfico** — compreensão dos primitivos (não da matemática interna, mas das propriedades de segurança, dos modos de falha e dos critérios de escolha).
2. **Engenharia de software de produção** — capacidade de traduzir o primitivo em código que roda, escala e é mantível, usando bibliotecas auditadas e padrões de mercado.
3. **Arquitetura de sistemas distribuídos** — visão das camadas (cliente, borda, aplicação, serviço, dado, segredo) e de como a criptografia atravessa todas elas.

### A.2 Competências técnicas exigidas do condutor

| Domínio | Competência específica |
|---|---|
| **Primitivos** | Distinguir com precisão cifra simétrica, assimétrica, hash, hash de senha, MAC, assinatura, KDF, AEAD; conhecer os modos de falha de cada um. |
| **Node.js / cripto** | Operar o módulo `crypto` nativo, `libsodium` (via `sodium-native` ou `libsodium-wrappers`), `jose` para JWT/JWE, `argon2` e `bcrypt` para senha. |
| **TLS / PKI** | Montar cadeia de certificados com `openssl` e `step-ca`; configurar TLS 1.3 e mTLS; entender OCSP, CRL, CT logs. |
| **Gestão de segredos** | Operar HashiCorp Vault (dev e HA), AppRole, motores KV/DB/PKI, envelope encryption com KMS. |
| **Arquitetura** | Desenhar fluxo de dado em trânsito/repouso/uso através de todas as camadas; justificar cada controle. |
| **Ameaça** | Raciocinar em modelo de ameaça: para cada controle, responder "protege contra quem, e não protege contra quem". |

### A.3 Postura pedagógica exigida

- **Rigor sem misticismo**: criptografia não é magia. Cada escolha tem razão explicável e modo de falha conhecido.
- **"Não implemente seu próprio cripto" como lei**: a oficina ensina a *usar* corretamente bibliotecas auditadas, não a reinventar AES. As demonstrações de "como funciona por dentro" servem ao entendimento, jamais à reimplementação em produção.
- **Modelo de ameaça sempre explícito**: nenhum controle é apresentado como "seguro" em abstrato. Sempre: seguro *contra o quê*.
- **Ligação com o mercado**: cada camada é acompanhada de "como a indústria faz isto hoje" — com referência a práticas reais de empresas de tecnologia, provedores cloud e padrões (OWASP, NIST, RFC).

---

## PARTE B — ARQUITETURA PEDAGÓGICA DA OFICINA

### B.1 Princípio estruturante: um sistema, construído por camadas

A oficina **não** é uma coleção de exercícios avulsos. É a construção progressiva de **um único sistema realista** — uma aplicação de telemedicina fictícia chamada **"MedSeguro"** — em que cada encontro adiciona uma camada criptográfica, sempre justificada por uma ameaça concreta.

Ao final, os alunos terão construído (e compreendido) um sistema que passa por todas as camadas em que a criptografia atua na indústria:

```
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA 0 — CLIENTE            (navegador / app do paciente)      │
│  · HTTPS obrigatório, HSTS, CSP                                   │
├──────────────────────────────────────────────────────────────────┤
│  CAMADA 1 — BORDA / TLS        (reverse proxy, terminação TLS)    │
│  · TLS 1.3, certificados, OCSP stapling                           │
├──────────────────────────────────────────────────────────────────┤
│  CAMADA 2 — APLICAÇÃO          (API Node.js)                      │
│  · Hash de senha (Argon2id), sessão, JWT, MFA (TOTP/WebAuthn)     │
├──────────────────────────────────────────────────────────────────┤
│  CAMADA 3 — SERVIÇO A SERVIÇO  (microserviços internos)           │
│  · mTLS, identidade de carga de trabalho, rotação de certificado  │
├──────────────────────────────────────────────────────────────────┤
│  CAMADA 4 — DADO               (banco de dados)                   │
│  · Cifragem em repouso: volume, coluna, campo; envelope encryption│
├──────────────────────────────────────────────────────────────────┤
│  CAMADA 5 — SEGREDO            (cofre)                            │
│  · HashiCorp Vault, AppRole, credenciais dinâmicas, KMS, rotação  │
└──────────────────────────────────────────────────────────────────┘
```

### B.2 O cenário: "MedSeguro" (telemedicina fictícia)

Sistema fictício que justifica todas as decisões criptográficas por conter o tipo de dado mais crítico sob a LGPD:

- **Dados tratados**: cadastro de pacientes (nome, CPF, contato), prontuários (dado sensível — saúde, art. 5º, II), prescrições, laudos, agendamentos.
- **Atores**: paciente (cliente web/mobile), médico (autenticação forte), sistema de prescrição (microserviço), sistema de prontuário (microserviço), banco de dados.
- **Por que telemedicina**: concentra dado pessoal sensível, exige autenticação robusta, envolve comunicação entre serviços, tem obrigações regulatórias claras (LGPD art. 46; regulação do CFM). É o cenário ideal para justificar "por que tanta criptografia".

### B.3 Distribuição dos 12 encontros

**Regime**: 3 encontros por semana, 4 semanas. Cada encontro ~2h (1 teórica curta + prática guiada).

| Semana | Encontro | Camada / Tema | Entregável do encontro |
|---|---|---|---|
| **1** | 1 | Fundamentos operacionais + setup do ambiente | Ambiente Node/Docker funcional; primeiro hash e AEAD |
| | 2 | Hash de senha e armazenamento de credenciais | Módulo de cadastro/login com Argon2id |
| | 3 | Cifragem simétrica autenticada (AEAD) na aplicação | Cifragem de campo de prontuário funcionando |
| **2** | 4 | Criptografia assimétrica e esquema híbrido | Troca de mensagem cifrada médico↔paciente |
| | 5 | TLS 1.3 e a camada de borda | MedSeguro atrás de proxy com HTTPS + HSTS |
| | 6 | PKI privada e certificados | Cadeia raiz→intermediária→folha montada |
| **3** | 7 | Autenticação: sessão, JWT e seus perigos | Sessão segura + JWT bem implementado |
| | 8 | MFA: TOTP e WebAuthn/Passkeys | Segundo fator funcional para médicos |
| | 9 | mTLS entre microserviços | Prontuário↔Prescrição autenticados por certificado |
| **4** | 10 | Gestão de segredos com HashiCorp Vault | Segredos migrados de `.env` para o cofre |
| | 11 | Envelope encryption, KMS e rotação de chave | Dados em repouso com DEK/KEK e rotação |
| | 12 | Integração final, auditoria e apresentação | Sistema completo + relatório de arquitetura |

> **⚠️ Realismo temporal.** Os Encontros **5, 6, 9, 10 e 11** envolvem infraestrutura pesada (proxy TLS, PKI, mTLS, Vault, banco) e, com turma iniciante, tendem a exigir **3-4h cada** apenas para setup e depuração de ambiente. Duas medidas mantêm o cronograma de 12 encontros × 2h: (1) o **repositório-esqueleto pré-configurado** descrito no Encontro 1 (compose, certificados de exemplo e `bootstrap-vault.sh` prontos), e (2) *pré-flight* — o docente valida o ambiente de todos antes do encontro pesado. Sem essas medidas, planeje **16 encontros**, desmembrando 5, 6, 9, 10 e 11 em setup + conteúdo.

### B.4 Modelo de ameaça transversal (referência para toda a oficina)

Cada controle da oficina responde a uma ou mais destas ameaças. A tabela é afixada no laboratório e revisitada a cada encontro:

| # | Ameaça | Quem | Onde se protege |
|---|---|---|---|
| T1 | Interceptação de tráfego | Atacante na rede | Camada 1 (TLS) |
| T2 | Vazamento de banco de dados | Atacante que exfiltra o DB | Camadas 2 (senha) e 4 (dado) |
| T3 | Roubo físico de disco/backup | Quem obtém a mídia | Camada 4 (repouso) |
| T4 | DBA ou insider malicioso | Acesso legítimo abusado | Camada 4 (cifragem de campo) |
| T5 | Comprometimento de credencial | Phishing, vazamento, reuso | Camada 2 (MFA) |
| T6 | Segredo em código-fonte | Exposição em repositório | Camada 5 (cofre) |
| T7 | Serviço interno falsificado | Movimentação lateral | Camada 3 (mTLS) |
| T8 | Chave comprometida | Vazamento de chave mestra | Camada 5 (rotação, envelope) |

---

## GLOSSÁRIO

> **Fronteira de conhecimento-base.** Esta oficina é **autocontida**: todos os termos, siglas e conceitos criptográficos usados nos encontros estão definidos abaixo, do fundamento ao operacional. Pressupõe-se apenas conhecimento prévio de programação em JavaScript/Node.js, HTTP/HTTPS em nível de uso, e noções de banco de dados relacional — não se pressupõe criptografia prévia. Onde um termo tem armadilha de uso (I2 — onde a definição, se omitida, induziria a erro), a entrada declara explicitamente o modo de falha.
>
> O glossário está organizado em oito grupos temáticos para consulta dirigida; dentro de cada grupo, a ordem é conceitual (do mais básico ao derivado), não alfabética.

### G.1 Objetivos e conceitos fundamentais

| Termo | Definição operacional |
|---|---|
| **Criptografia** | Conjunto de técnicas matemáticas para proteger informação contra leitura, alteração ou repúdio não autorizados. Persegue três objetivos distintos: confidencialidade, integridade e autenticidade — cada um com primitivos próprios. |
| **Confidencialidade** | Propriedade de que a informação só é legível por quem detém a chave. Obtida por cifragem. |
| **Integridade** | Propriedade de que alteração da informação é detectável. Obtida por hash, MAC ou assinatura. |
| **Autenticidade** | Propriedade de que a origem da informação é verificável. Obtida por MAC (entre partes com chave compartilhada) ou assinatura digital (verificável por terceiros). |
| **Não-repúdio** | Garantia de que o autor de uma mensagem não pode negar tê-la produzido. Só a assinatura digital (chave privada exclusiva) oferece; MAC **não** oferece, pois a chave é compartilhada. |
| **Texto claro** *(plaintext)* | Dado legível antes da cifragem (ou após a decifragem). |
| **Texto cifrado** *(ciphertext)* | Resultado da cifragem — ilegível sem a chave. |
| **Codificação** *(encoding)* | Representação de dados em outro alfabeto (Base64, hexadecimal). **Não é criptografia**: não usa chave, não protege nada — Base64 é reversível por qualquer um. Confundir codificação com cifragem é um dos erros mais comuns e graves. |
| **Chave** *(key)* | Segredo (ou par de segredos) que parametriza operações criptográficas. Sua proteção é o que separa segurança de exposição. |
| **Entropia** | Medida de imprevisibilidade. Chaves e tokens precisam de entropia suficiente (tipicamente ≥ 128 bits) para resistir a busca exaustiva. Baixa entropia é adivinhável. |
| **Primitivo criptográfico** | Bloco de construção elementar (uma cifra, um hash, uma função de assinatura). Sistemas combinam primitivos; o engenheiro os **usa via biblioteca**, não os reimplementa. |
| **Modelo de ameaça** *(threat model)* | Descrição explícita de contra quem/o quê um controle protege. Nenhum controle é "seguro" em abstrato — só seguro *contra ameaças específicas*. Toda a oficina raciocina assim (ameaças T1–T8). |

### G.2 Hash e hash de senha

| Termo | Definição operacional |
|---|---|
| **Hash criptográfico** | Função determinística que mapeia entrada de tamanho arbitrário para saída de tamanho fixo (resumo), com três propriedades: resistência à pré-imagem, à segunda pré-imagem e à colisão. Unidirecional, sem chave, sem inversão prevista. Serve à integridade, não à confidencialidade. Exemplos modernos: SHA-256, SHA-3, BLAKE2/3. |
| **SHA-256** | Função de hash da família SHA-2 (saída de 256 bits). Segura para integridade. **Rápida de propósito** — o que a torna imprópria para senhas. |
| **MD5 / SHA-1** | Funções de hash legadas, **quebradas** para uso criptográfico (colisões viáveis). Nunca usar em contexto de segurança. |
| **Hash de senha** *(password hashing)* | Família distinta de funções projetadas para serem **deliberadamente lentas e custosas em memória**, dificultando ataque por GPU/ASIC contra uma base vazada. A lentidão é a defesa, não um defeito. Exemplos: Argon2id, scrypt, bcrypt. *Jamais usar SHA-256 puro para senha.* |
| **Argon2id** | Função de hash de senha vencedora da Password Hashing Competition (2015). Estado da arte. Parametrizável por custo de memória, iterações e paralelismo. Variante "id" combina resistência a ataques de canal lateral e a GPU. |
| **bcrypt** | Função de hash de senha baseada no algoritmo Blowfish (1999). Padrão de facto por muitos anos; aceitável quando Argon2id não está disponível. Limite de 72 bytes de senha. |
| **scrypt** | Função de hash de senha com fator de custo de memória (2009). Alternativa intermediária entre bcrypt e Argon2id. |
| **Salt** | Valor aleatório único por senha, combinado antes do hash. Impede tabelas pré-computadas (rainbow tables) e faz senhas idênticas produzirem hashes distintos. Não é secreto — armazena-se junto ao hash. As bibliotecas de hash de senha o embutem automaticamente. |
| **Pepper** | Valor secreto adicional, armazenado **separado do banco** (em cofre/HSM), aplicado a todos os hashes. Separa "quebra exclusiva da base" de "quebra completa". Opcional, mas valioso. |
| **Rainbow table** | Tabela pré-computada de hashes para reverter senhas rapidamente. Neutralizada pelo salt. |
| **Ataque offline** | Cenário em que o atacante já possui a base de hashes e testa candidatos em seu próprio hardware, sem limite de tentativas. É o modelo de ameaça que justifica hash de senha lento. |
| **Ataque online** | Tentativas contra o sistema em operação (endpoint de login). Defendido por rate limiting, lockout e MFA — **não** por hash forte, que só protege após vazamento. |

### G.3 Cifragem simétrica e AEAD

| Termo | Definição operacional |
|---|---|
| **Cifra simétrica** | Algoritmo em que a mesma chave cifra e decifra. Eficiente; usada para o grosso do tráfego. Ex.: AES, ChaCha20. |
| **Cifra assimétrica** | Ver G.4. |
| **AES** *(Advanced Encryption Standard)* | Cifra simétrica de blocos padronizada pelo NIST (2001, FIPS 197). Chaves de 128, 192 ou 256 bits; blocos de 128 bits. |
| **ChaCha20** | Cifra de fluxo moderna, alternativa ao AES; excelente performance em CPUs sem aceleração AES (dispositivos móveis). |
| **Modo de operação** | Esquema que estende uma cifra de blocos para mensagens de tamanho arbitrário. Modos seguros modernos são AEAD (GCM, Poly1305). Modos perigosos: ECB (vaza padrões), CBC sem MAC (vulnerável a padding oracle). |
| **AEAD** *(Authenticated Encryption with Associated Data)* | Construção que entrega confidencialidade **e** autenticidade em uma única operação, e permite autenticar (sem cifrar) metadados associados. Recomendação canônica atual. Exemplos: AES-256-GCM, ChaCha20-Poly1305, XChaCha20-Poly1305. Usar AEAD elimina a classe de bugs de cifrar-sem-autenticar. |
| **AES-GCM** *(Galois/Counter Mode)* | Modo AEAD do AES. Rápido com hardware AES dedicado. **Armadilha crítica**: o nonce **nunca** pode repetir sob a mesma chave — repetição permite recuperar a chave de autenticação e forjar mensagens. |
| **ChaCha20-Poly1305** | Construção AEAD combinando a cifra ChaCha20 com o autenticador Poly1305. Suite obrigatória em TLS 1.3. |
| **XChaCha20-Poly1305** | Variante do ChaCha20-Poly1305 com nonce estendido de 192 bits. O nonce longo permite gerá-lo **aleatoriamente** sem risco prático de colisão — simplicidade operacional que a oficina prefere para cifragem de campo. |
| **secretbox** | API de alto nível do libsodium para cifragem autenticada simétrica (XSalsa20-Poly1305). Fecha a porta para escolhas erradas de modo. |
| **Nonce** *(number used once)* | Valor que individualiza cada operação de cifragem com uma dada chave. **Não é secreto** (pode ser armazenado/transmitido em claro), mas em GCM **nunca deve repetir** sob a mesma chave. O termo mais frequente desta oficina — e sua armadilha, a mais perigosa. |
| **IV** *(Initialization Vector)* | Sinônimo prático de nonce em muitos contextos: valor que garante que cifrar a mesma mensagem duas vezes produza saídas diferentes. |
| **Auth tag** *(tag de autenticação)* | Código de autenticação (tipicamente 128 bits) produzido pela cifragem AEAD, verificado na decifragem. Se o texto cifrado for adulterado, a verificação do tag falha e a decifragem é recusada. |
| **Associated Data (AD)** | Metadados autenticados mas **não** cifrados por uma operação AEAD. Ex.: vincular criptograficamente um registro cifrado ao ID do paciente, de modo que reatribuí-lo a outro paciente faça a autenticação falhar. |
| **Padding oracle** | Categoria de ataque (Vaudenay, 2002) contra CBC sem MAC, em que mensagens de erro distinguem "padding válido/inválido" e permitem decifrar byte a byte. Razão pela qual AES-CBC puro é desaconselhado — e pela qual se usa AEAD. |

### G.4 Criptografia assimétrica, assinatura e troca de chave

| Termo | Definição operacional |
|---|---|
| **Cifra assimétrica** *(criptografia de chave pública)* | Algoritmo com par de chaves: o que a pública cifra, só a privada decifra (e vice-versa para assinatura). Cara computacionalmente; usada para troca de chave, assinatura e identidade — não para cifrar grandes volumes. |
| **Par de chaves** *(keypair)* | Conjunto (chave pública, chave privada). A pública é compartilhável; a privada nunca sai do dono. |
| **Chave pública / privada** | A pública é distribuída livremente; a privada é o segredo que autentica ou decifra. Comprometer a privada compromete a identidade. |
| **RSA** | Algoritmo assimétrico clássico (1978), baseado na dificuldade de fatoração. Tamanho mínimo seguro hoje: 2048 bits; recomendado 3072+ para horizontes longos. |
| **ECDSA** *(Elliptic Curve Digital Signature Algorithm)* | Assinatura sobre curvas elípticas. Chaves muito menores que RSA para segurança equivalente (256 bits EC ≈ 3072 bits RSA). **Armadilha**: nonce de assinatura repetido revela a chave privada. |
| **Ed25519** | Esquema de assinatura sobre a curva Edwards-25519 (2011). Estado da arte: rápido, seguro, com geração de nonce determinística que evita a armadilha do ECDSA. Recomendado para sistemas novos. |
| **X25519** | Função de troca de chave (Diffie-Hellman) sobre a curva Curve25519. Base do `crypto_box`. Não confundir com Ed25519 (assinatura) — mesma curva, propósitos distintos. |
| **Curva elíptica** | Estrutura matemática que permite criptografia assimétrica com chaves pequenas. Curvas comuns: P-256 (NIST), Curve25519. |
| **Assinatura digital** | Autenticação assimétrica: o signatário usa a chave privada; qualquer um verifica com a pública. Oferece autenticidade + integridade + **não-repúdio**. `crypto_sign` (libsodium) usa Ed25519. |
| **MAC** *(Message Authentication Code)* | Autenticação **simétrica**: prova integridade e autenticidade para quem detém a chave compartilhada. **Não** oferece não-repúdio (ambos os lados têm a chave). Ex.: HMAC. |
| **HMAC** *(Hash-based MAC)* | Construção (RFC 2104) que combina chave secreta e função de hash. `HMAC-SHA-256` é o padrão prático. Usado, por exemplo, para assinar JWT com o algoritmo HS256. |
| **Diffie-Hellman (DH)** | Protocolo (1976) que permite a duas partes derivarem um segredo compartilhado sobre canal inseguro. Variante em curvas: ECDH / X25519. |
| **Esquema híbrido** | Padrão universal (TLS, PGP, Signal, envelope encryption): a cifra assimétrica protege apenas uma chave simétrica; a chave simétrica cifra o dado. Resolve a lentidão da cifra assimétrica. |
| **crypto_box** | API de alto nível do libsodium para o esquema híbrido entre um par de partes (X25519 + XSalsa20-Poly1305). Dá confidencialidade e autenticação por chave compartilhada — **não** não-repúdio (para isso, `crypto_sign`). |
| **Forward secrecy (PFS)** *(perfect forward secrecy)* | Propriedade em que o comprometimento futuro de chaves de longo prazo **não** permite decifrar tráfego passado. Garantida em TLS 1.3 e em TLS 1.2 com troca de chave efêmera (ECDHE). |
| **Ratcheting / Double Ratchet** | Mecanismo (usado pelo Signal) em que as chaves evoluem a cada mensagem, dando forward secrecy contínua. Vai muito além do `crypto_box` simples — não confundir o tijolo (crypto_box) com o edifício (protocolo Signal). |

### G.5 TLS, PKI e certificados

| Termo | Definição operacional |
|---|---|
| **TLS** *(Transport Layer Security)* | Protocolo que provê confidencialidade, integridade e autenticidade em comunicações sobre TCP. Sucessor do SSL. Versão mínima aceitável hoje: TLS 1.2; preferida: TLS 1.3 (RFC 8446). |
| **SSL** | Antecessor do TLS, hoje inteiramente obsoleto e inseguro. O termo "SSL" persiste coloquialmente, mas o protocolo em uso é TLS. |
| **HTTPS** | HTTP sobre TLS. |
| **Handshake** | Fase inicial de uma conexão TLS em que as partes negociam algoritmos, trocam/derivam chaves e (no mTLS) apresentam certificados. TLS 1.3 reduziu o handshake a 1 ida-e-volta (1-RTT). |
| **mTLS** *(mutual TLS)* | TLS em que **ambos** os lados apresentam certificado — cliente também se autentica ao servidor. Padrão para comunicação serviço-a-serviço em arquitetura zero-trust. |
| **HSTS** *(HTTP Strict Transport Security)* | Cabeçalho HTTP (RFC 6797) que instrui o navegador a usar exclusivamente HTTPS para o domínio por um período. Mitiga downgrade e SSL-stripping. |
| **Downgrade attack** | Ataque que força o protocolo a operar em versão/algoritmo menos seguro. Mitigado por HSTS e pelo design do TLS 1.3. |
| **PFS / ECDHE** | Ver forward secrecy (G.4). ECDHE é a troca de chave efêmera em curva elíptica que a garante em TLS. |
| **PKI** *(Public Key Infrastructure)* | Conjunto de papéis, políticas e procedimentos que viabiliza emitir, distribuir, usar e revogar certificados de chave pública. Responde à pergunta "esta chave pública é mesmo de quem diz ser?". |
| **Certificado X.509** | Estrutura padronizada (RFC 5280) que vincula uma chave pública a uma identidade, assinada por uma CA. Formato dominante em TLS, e-mail e assinatura de código. |
| **CA** *(Certificate Authority / Autoridade Certificadora)* | Entidade que emite certificados atestando a vinculação chave–identidade. Pode ser pública (Let's Encrypt, DigiCert) ou privada (CA interna da organização). |
| **CA raiz** *(root CA)* | CA cujo certificado é autoassinado e é o ponto de confiança última. Mantida offline, idealmente em hardware; usada só para assinar CAs intermediárias. |
| **CA intermediária** | CA assinada pela raiz, usada operacionalmente para emitir certificados-folha. Se comprometida, a raiz a revoga inteira sem precisar ser exposta. |
| **Certificado-folha** *(end-entity / leaf)* | Certificado de servidor ou cliente, emitido por CA intermediária para uso operacional. Validade curta (ex.: 90 dias). |
| **Cadeia de confiança** | Sequência raiz → intermediária → folha que o cliente verifica para confiar num certificado. |
| **CSR** *(Certificate Signing Request)* | Estrutura (PKCS #10) enviada à CA contendo a chave pública e os atributos pretendidos, assinada com a chave privada como prova de posse. |
| **CN** *(Common Name)* | Campo do certificado historicamente usado para o nome do host. **Obsoleto** para identificação de host — substituído pelo SAN. Autorizar por CN repete um padrão superado. |
| **SAN** *(Subject Alternative Name)* | Extensão do certificado que lista os nomes (DNS, IP, URI) para os quais ele é válido. Substitui o CN. A autorização de serviço deve basear-se no SAN. |
| **EKU** *(Extended Key Usage)* | Extensão que declara os usos permitidos do certificado (serverAuth, clientAuth). Menor privilégio pede EKU específico por papel. |
| **CRL** *(Certificate Revocation List)* | Lista assinada pela CA com certificados revogados antes do vencimento. Distribuída via HTTP; limitada em escala. |
| **OCSP** *(Online Certificate Status Protocol)* | Protocolo (RFC 6960) que consulta o status de revogação de um certificado individual. **OCSP stapling**: o servidor anexa uma resposta OCSP recente à conexão TLS, evitando que o cliente consulte a CA (aplica-se a certificados de CA pública com responder; não a certificados internos sem responder). |
| **Certificate Transparency (CT)** | Logs públicos append-only (RFC 6962) onde CAs registram certificados emitidos, permitindo detectar emissões indevidas. |
| **ACME** *(Automatic Certificate Management Environment)* | Protocolo (RFC 8555) que automatiza emissão e renovação de certificados TLS. Usado por Let's Encrypt e pelo Certbot; embutido em proxies como o Caddy. |
| **HSM** *(Hardware Security Module)* | Dispositivo dedicado e certificado (FIPS 140-2/3) que armazena chaves e executa operações sem expor o material da chave ao sistema hospedeiro. |
| **SPIFFE / SPIRE** | Padrão (SPIFFE) e implementação (SPIRE) de **identidade de carga de trabalho**: cada serviço recebe um identificador verificável (`spiffe://dominio/servico`) usado no SAN, padronizando o mTLS entre serviços independentemente de DNS. |
| **Workload identity** *(identidade de carga de trabalho)* | Identidade criptográfica atribuída a um serviço/processo (não a uma pessoa), usada para autenticá-lo a outros serviços. |
| **Service mesh** | Camada de infraestrutura (Istio, Linkerd) que injeta sidecars para fazer mTLS transparente entre serviços, com rotação automática de certificados. |
| **Sidecar** | Contêiner auxiliar que roda ao lado do serviço principal e intercepta seu tráfego (ex.: para aplicar mTLS sem alterar o código da aplicação). |
| **Zero-trust** | Modelo de segurança que não confia em nada por estar "na rede interna": toda requisição é autenticada e autorizada. "Nunca confie, sempre verifique." |
| **Reverse proxy** *(proxy reverso)* | Servidor intermediário que recebe requisições do cliente e as encaminha à aplicação (ex.: Caddy, Nginx). Termina o TLS na borda, isolando a aplicação da camada de transporte. |
| **Terminação TLS** | Ponto onde a conexão TLS é decifrada. Tipicamente na borda (proxy/balanceador), não na aplicação. |

### G.6 Autenticação, sessão e tokens

| Termo | Definição operacional |
|---|---|
| **Autenticação** | Verificar a identidade declarada ("quem é você?"). Baseada em fatores: algo que sabe (senha), tem (token/chave), é (biometria). |
| **Autorização** | Decidir o que uma identidade autenticada pode fazer ("o que você pode?"). Distinta de autenticação. |
| **Sessão** | Estado que mantém um usuário autenticado entre requisições. Pode ser com estado (ID no cookie, dados no servidor/Redis) ou sem estado (token autocontido). |
| **Cookie** | Pequeno dado que o navegador armazena e reenvia ao servidor. Cookies de sessão exigem flags de segurança (ver abaixo). |
| **HttpOnly** | Flag de cookie que o torna inacessível a JavaScript (`document.cookie`). Mitiga roubo de sessão por XSS. Mitigação adjacente, não raiz. |
| **Secure** *(flag de cookie)* | Flag que restringe o envio do cookie a conexões HTTPS. |
| **SameSite** | Flag de cookie (`Strict`/`Lax`/`None`) que controla o envio em requisições de origem diferente. Mitiga CSRF. |
| **XSS** *(Cross-Site Scripting)* | Vulnerabilidade em que o atacante executa JavaScript no navegador da vítima. Se o cookie de sessão não for HttpOnly, o XSS pode roubá-lo. |
| **CSRF** *(Cross-Site Request Forgery)* | Ataque que induz o navegador da vítima a emitir requisição autenticada não intencional. Mitigado por `SameSite` e tokens anti-CSRF. |
| **JWT** *(JSON Web Token)* | Token em três partes (header.payload.signature) codificadas em Base64URL, carregando *claims* assinados. Verificável sem consultar o emissor. **Armadilhas**: aceitar `alg:none`, confusão de algoritmo, e armazená-lo em `localStorage` (exposto a XSS). |
| **JWS / JWE** | JSON Web Signature (token assinado) e JSON Web Encryption (token cifrado) — as duas formas formais do JWT. |
| **Claim** | Afirmação contida no payload de um JWT (ex.: `sub` = identidade, `exp` = expiração, `iss` = emissor, `aud` = audiência). |
| **alg:none** | Valor de algoritmo que indica JWT sem assinatura. Aceitá-lo é vulnerabilidade clássica: o atacante forja tokens. Verificadores devem declarar explicitamente os algoritmos aceitos. |
| **HS256 / RS256** | Algoritmos de assinatura de JWT: HS256 é HMAC-SHA-256 (chave simétrica); RS256 é RSA-SHA-256 (par de chaves). Confundi-los (verificar RS256 como HS256) é vetor de ataque. |
| **jose** | Biblioteca Node de referência para JWT/JWS/JWE que obriga a declarar algoritmos aceitos, prevenindo a classe de bugs de `alg`. |
| **MFA** *(Multi-Factor Authentication)* | Autenticação com dois ou mais fatores de **categorias distintas**. Duas senhas não são MFA (mesmo fator). |
| **OTP** *(One-Time Password)* | Código de uso único e validade curta. Duas variantes: HOTP (por contador, RFC 4226) e TOTP (por tempo, RFC 6238). A oficina pratica **apenas TOTP** (Encontro 8); HOTP é definido para contraste conceitual, não exercitado. |
| **TOTP** *(Time-based OTP)* | OTP derivado de um segredo compartilhado e do relógio, em janelas de ~30s. Implementado por Google Authenticator, Authy, FreeOTP. Vulnerável a phishing em tempo real; **não** impede replay do código dentro da janela por si só. |
| **Janela (TOTP)** | Tolerância que aceita códigos de intervalos adjacentes, cobrindo relógios dessincronizados. Janela maior = mais usável, porém mais códigos válidos ao mesmo tempo. |
| **FIDO2 / WebAuthn** | Padrão (W3C/FIDO Alliance) de autenticação assimétrica: o autenticador prova posse da chave privada assinando um desafio **vinculado à origem**, sem transmitir segredo. Resistente a phishing por construção. |
| **Passkey** | Credencial WebAuthn sincronizável entre dispositivos do usuário via provedor de plataforma (Apple, Google, Microsoft). Substitui a senha por par de chaves. |
| **Secure context** | Requisito do navegador para habilitar APIs sensíveis (como WebAuthn): HTTPS com certificado confiável **ou** a origem `localhost`. Um domínio interno com certificado não confiável não é secure context. |
| **rpID / origin (WebAuthn)** | `rpID` (Relying Party ID) é o domínio para o qual a credencial vale; `origin` é a origem exata que o autenticador assina. É o que torna a assinatura inútil em site de phishing. |
| **userVerification** | Parâmetro WebAuthn que exige (`required`) ou não (`preferred`) verificação local do usuário (biometria/PIN). `preferred` permite downgrade silencioso. |
| **Attestation** *(atestação)* | Prova, no registro WebAuthn, de que o autenticador é de um tipo/fabricante confiável. `'none'` dispensa a verificação (mais simples); importa quando se quer garantir hardware homologado. |
| **Credential stuffing** | Reuso de pares usuário/senha vazados de terceiros contra o sistema-alvo, explorando reuso de senha. Distinto de força bruta. |
| **Session fixation** | Ataque em que o adversário impõe à vítima um ID de sessão que ele conhece. Mitigado renovando o ID no login. |
| **Rate limiting** | Limitação da taxa de requisições (ex.: tentativas de login por IP/conta) para conter ataques online (brute force, credential stuffing). |
| **SSO / OAuth 2.0 / OIDC / SAML** | Federação de identidade: SSO é a experiência de login único; OAuth 2.0 é framework de **autorização** (não autenticação); OpenID Connect (OIDC) adiciona autenticação sobre OAuth; SAML é o padrão XML equivalente em ambientes corporativos. |

### G.7 Dado em repouso, chaves e cofre de segredos

| Termo | Definição operacional |
|---|---|
| **Em trânsito** *(in transit)* | Estado do dado sendo transmitido. Protegido por TLS. |
| **Em repouso** *(at rest)* | Estado do dado armazenado (disco, banco, backup). Protegido por cifragem de volume, coluna ou campo. |
| **Em uso** *(in use)* | Estado do dado em processamento (memória). Proteção avançada: enclaves de hardware, computação confidencial. |
| **Cifragem de volume** | Cifra todo o disco/partição (LUKS, BitLocker, dm-crypt). Protege contra acesso físico/furto de mídia; **não** protege contra quem tem acesso lógico legítimo (DBA). |
| **Cifragem de campo** *(field-level / application-level)* | Cifra campos específicos na aplicação, antes de tocar o banco, com chave fora do banco. Protege contra DBA/insider e dump acidental — o que a cifragem de volume não faz. |
| **KMS** *(Key Management Service)* | Serviço dedicado ao ciclo de vida de chaves (geração, rotação, revogação, controle de acesso), executando operações sem expor a chave ao chamador. Ex.: AWS KMS, GCP KMS, motor `transit` do Vault. |
| **DEK** *(Data Encryption Key / chave de dados)* | Chave simétrica que cifra diretamente o dado. Pequena o suficiente para ser ela mesma cifrada por uma KEK. |
| **KEK** *(Key Encryption Key / chave de chaves)* | Chave mestra que cifra as DEKs. Guardada no KMS/cofre, nunca na aplicação. Rotacioná-la reencripta apenas as DEKs, não o dado. |
| **Envelope encryption** | Padrão de cifragem em duas camadas: a DEK cifra o dado; a KEK (no KMS) cifra a DEK. Permite rotação barata da chave mestra em escala — só as DEKs são reescritas. Modelo de AWS/GCP KMS e do motor `transit` do Vault. |
| **Rewrap** | Operação que reescreve uma DEK-cifrada para uma nova versão da KEK **sem decifrar o dado**. Torna a rotação de chave barata. |
| **Rotação de chave** | Substituição periódica da chave em uso (exigência regulatória e boa prática após suspeita de comprometimento). Com envelope encryption, envolve só as DEKs. |
| **KDF** *(Key Derivation Function)* | Função que deriva uma ou mais chaves a partir de material secreto. HKDF para material de alta entropia; Argon2/PBKDF2/scrypt para senhas. |
| **CSPRNG** *(Cryptographically Secure Pseudo-Random Number Generator)* | Gerador de aleatoriedade seguro para uso criptográfico. Em Node: `crypto.randomBytes`. Nunca usar `Math.random()` para chaves, nonces ou tokens — é previsível. |
| **Cofre de segredos** *(secrets vault)* | Sistema dedicado ao armazenamento e distribuição controlada de credenciais, chaves e tokens em runtime. Ex.: HashiCorp Vault, AWS Secrets Manager. |
| **HashiCorp Vault** | Cofre de segredos FOSS usado na oficina. Oferece mecanismos de segredo (KV, database, PKI, transit), métodos de autenticação (AppRole) e audit log. |
| **KV** *(Key-Value)* | Mecanismo do Vault para segredos estáticos (pares chave-valor). |
| **AppRole** | Método de autenticação do Vault para **máquinas/aplicações** (não pessoas): a aplicação prova identidade com `role_id` + `secret_id` e recebe um token com políticas. |
| **Credencial dinâmica** | Credencial gerada sob demanda pelo cofre, com TTL curto (ex.: usuário PostgreSQL efêmero criado por requisição). Se vazar, expira em minutos; nunca é compartilhada entre processos. |
| **TTL** *(Time To Live)* | Tempo de vida de um token ou credencial antes de expirar. TTL curto limita a janela de exposição. |
| **Unsealing** *(destravamento)* | Processo de destravar o Vault ao iniciar. A chave mestra é dividida por Shamir Secret Sharing em N partes, exigindo M delas — nenhuma pessoa sozinha abre o cofre. |
| **Shamir Secret Sharing** | Esquema que divide um segredo em N partes, das quais quaisquer M reconstroem o segredo (M ≤ N). Base do unsealing do Vault; controle organizacional de "duas chaves para o cofre". |
| **Audit log** | Registro estruturado e íntegro de todas as operações do cofre, para auditoria e detecção. |
| **Envelope / DEK / KEK (resumo visual)** | Dado ← cifrado por → **DEK** ← cifrada por → **KEK** (no cofre). Rotacionar KEK reescreve só a DEK-cifrada. |

### G.8 Infraestrutura, ferramentas e termos de mercado

| Termo | Definição operacional |
|---|---|
| **Node.js** | Runtime JavaScript do lado do servidor, base da aplicação da oficina. **LTS** = Long-Term Support, a linha estável recomendada para produção. |
| **libsodium** | Biblioteca criptográfica moderna e auditada, com APIs de alto nível (secretbox, crypto_box, AEAD) que previnem erros de uso. Acessada em Node via `libsodium-wrappers` ou `sodium-native`. |
| **Docker / contêiner** | Tecnologia de empacotamento que isola aplicações e serviços. **Docker Compose** orquestra múltiplos contêineres (app, proxy, banco, cofre) num arquivo. |
| **Caddy** | Servidor/proxy reverso com TLS automático (ACME embutido). Usado na oficina para a camada de borda. |
| **PostgreSQL** | Banco de dados relacional usado na oficina. |
| **Redis** | Armazenamento em memória usado como store de sessão externo (compartilhável entre múltiplas instâncias da aplicação). |
| **openssl** | Ferramenta de linha de comando para operações criptográficas e de PKI (gerar chaves, CSRs, certificados, CRLs). |
| **step-ca** | CA privada FOSS (Smallstep) que automatiza emissão/renovação de certificados internos — alternativa ao `openssl` manual. |
| **cert-manager** | Controlador Kubernetes que automatiza emissão e renovação de certificados. |
| **testssl.sh** | Ferramenta que audita a configuração TLS de um endpoint e atribui nota. |
| **CSP** *(Content Security Policy)* | Cabeçalho HTTP que restringe as origens de scripts, estilos e mídia. Mitigação canônica de XSS. Uma política genérica quebra o front-end; exige política pensada, idealmente com nonce. |
| **DNS** *(Domain Name System)* | Sistema que traduz nomes em endereços IP. No Compose, os nomes de serviço (`app`, `vault`, `postgres`) resolvem via DNS interno da rede de contêineres. |
| **FOSS** *(Free and Open Source Software)* | Software livre e de código aberto. Todas as ferramentas centrais da oficina são FOSS ou têm free tier. |
| **SAST / DAST / SCA / SBOM** | Categorias de análise de segurança de software (estática / dinâmica / de composição / inventário de componentes) — mencionadas como prática de mercado; detalhadas no Eixo 3 da disciplina. |
| **STRIDE / LINDDUN** | Metodologias de modelagem de ameaças (STRIDE para segurança; LINDDUN para privacidade). |
| **CI/CD** | Integração e entrega contínuas — automação de build, teste e deploy onde testes de segurança se inserem. |
| **vitest** | Framework de testes usado na oficina para verificar propriedades de segurança (ex.: senha nunca persiste em claro). |
| **LGPD** *(Lei Geral de Proteção de Dados — Lei 13.709/2018)* | Lei brasileira de proteção de dados pessoais. O art. 46 exige medidas de segurança; o cenário MedSeguro trata dado sensível (saúde, art. 5º, II). |
| **CPF** | Cadastro de Pessoas Físicas — identificador nacional brasileiro; dado pessoal sob a LGPD. |
| **HA** *(High Availability / Alta Disponibilidade)* | Arquitetura com redundância que evita ponto único de falha. Relevante para o Vault, que de outro modo seria ponto único crítico. |
| **RTT** *(Round-Trip Time)* | Tempo de uma ida-e-volta na rede. TLS 1.3 reduz o handshake a 1-RTT. |
| **CRUD** | Create, Read, Update, Delete — as quatro operações básicas sobre dados. Uma aplicação que escreve precisa de mais que SELECT no banco. |

---

## PARTE C — DESENVOLVIMENTO DOS ENCONTROS

Cada encontro segue estrutura fixa: **contexto de mercado → ameaça → conceito → prática guiada → justificativa arquitetural → verificação**.

---

### 🔧 ENCONTRO 1 — Fundamentos Operacionais e Setup

**Objetivo**: estabelecer o ambiente, revisar operacionalmente os três objetivos da criptografia e produzir o primeiro código correto — sem reimplementar primitivos.

#### Como a indústria faz hoje
Nenhuma empresa séria implementa AES, SHA ou Argon2 do zero. Times de produção usam bibliotecas auditadas (`libsodium`, o módulo `crypto` do Node, `jose`) e concentram esforço em **usá-las corretamente**. A oficina espelha essa realidade desde a primeira linha.

#### Ameaça abordada
Fundacional — estabelece o vocabulário de ameaça que estrutura toda a oficina.

#### Conceito (teoria curta, ~20 min)
- Os três objetivos: confidencialidade, integridade, autenticidade — e o primitivo de cada.
- A distinção que mais gera bug em produção: **codificação (Base64) ≠ cifragem ≠ hash**.
- O princípio inflexível: *não implemente seu próprio cripto*.

#### Prática guiada

> **Repositório-esqueleto pré-configurado (recomendado).** Para que o tempo dos encontros seja gasto em *criptografia* e não em depurar ambiente (portas, DNS de contêiner, versões, TLS interno), o docente deve fornecer um repositório-esqueleto com: `docker-compose.yml` já montado (app, Caddy, Redis, Postgres, Vault), `Dockerfile` da aplicação, `bootstrap-vault.sh` idempotente, certificados de exemplo da PKI já gerados, e `.env.example`. Os alunos **modificam e compreendem**, não montam do zero. Sem esse esqueleto, os Encontros 5, 6, 9, 10 e 11 tendem a estourar as 2h só em setup — considere então 16 encontros em vez de 12.

**Setup do ambiente:**

```bash
# Node.js LTS + npm
node --version   # esperar v20+ (LTS)

# Projeto da oficina (ou clonar o repositório-esqueleto fornecido)
mkdir medseguro && cd medseguro
npm init -y

# Dependências criptográficas e de aplicação (todas as usadas na oficina).
# VERSÕES FIXADAS: a API de bibliotecas muda entre versões maiores — o otplib,
# por exemplo, reescreveu a API entre 12.x e 13.x. Fixar (pin) evita que uma
# atualização quebre um encontro. Versões abaixo verificadas em execução real
# (Node.js 22). Ao atualizar uma major, revalide o código correspondente.
npm install libsodium-wrappers@^0.8 argon2@^0.44 jose@^6 \
            express@^5 express-session@^1 connect-redis@^9 redis@^6 \
            express-rate-limit@^8 otplib@^13 qrcode@^1 \
            @simplewebauthn/server@^13 @simplewebauthn/browser@^13 node-vault@^0.12 pg@^8
npm install --save-dev vitest@^3    # testes

# Docker para as camadas posteriores
docker --version
```

> **Nota de versões (I3 — datação).** As versões acima foram verificadas por **execução real** em Node.js 22. O ponto crítico é o `otplib`: o código do Encontro 8 usa a API **13.x** (exports nomeados, `verify` assíncrona). Se preferir a API antiga (objeto `authenticator`), fixe `otplib@^12` e ajuste aquele bloco. Sempre que subir uma versão maior de qualquer biblioteca criptográfica, revalide o código do encontro correspondente antes da aula.

**Primeiro código — demonstrar os três objetivos:**

```javascript
// fundamentos.mjs
import sodium from 'libsodium-wrappers';
import crypto from 'node:crypto';

await sodium.ready;

// 1. HASH (integridade) — rápido, sem chave, unidirecional
const dado = 'prontuario-12345';
const hash = crypto.createHash('sha256').update(dado).digest('hex');
console.log('SHA-256:', hash);
// Mesma entrada => mesmo hash. Determinístico. NÃO usar para senha.

// 2. CIFRAGEM AUTENTICADA (confidencialidade + integridade)
//    libsodium secretbox = XSalsa20-Poly1305 (AEAD)
const chave = sodium.crypto_secretbox_keygen();
const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
const mensagem = sodium.from_string('Paciente diagnosticado com...');
const cifrado = sodium.crypto_secretbox_easy(mensagem, nonce, chave);
console.log('Cifrado (hex):', sodium.to_hex(cifrado));

// Decifrar — verifica o tag de autenticação automaticamente
const decifrado = sodium.crypto_secretbox_open_easy(cifrado, nonce, chave);
console.log('Decifrado:', sodium.to_string(decifrado));

// 3. DEMONSTRAR que alterar 1 byte quebra a autenticação
cifrado[0] ^= 0x01;   // corrompe um byte
try {
  sodium.crypto_secretbox_open_easy(cifrado, nonce, chave);
} catch {
  console.log('✓ Alteração detectada — a decifragem falhou (AEAD funcionando)');
}
```

#### Justificativa arquitetural
Por que `secretbox` e não "AES cru"? Porque `secretbox` é AEAD: entrega confidencialidade *e* autenticidade em uma chamada, sem deixar o desenvolvedor escolher errado o modo (o erro clássico de usar AES-ECB ou AES-CBC sem MAC). A biblioteca fecha a porta para a classe inteira de bugs de *padding oracle* e manipulação silenciosa.

#### Verificação (checklist do encontro)
- [ ] Ambiente Node + Docker funcional.
- [ ] Script `fundamentos.mjs` executa e demonstra os três objetivos.
- [ ] Aluno explica, em uma frase, por que alterar 1 byte fez a decifragem falhar.
- [ ] Aluno distingue, com exemplo próprio, codificação de cifragem de hash.

---

### 🔧 ENCONTRO 2 — Hash de Senha e Armazenamento de Credenciais

**Objetivo**: implementar cadastro e login com armazenamento de senha resistente a ataque offline, entendendo por que hash de propósito geral é inadequado.

#### Como a indústria faz hoje
Empresas maduras usam **Argon2id** (vencedor da Password Hashing Competition, 2015) como padrão para senhas novas, mantendo `bcrypt` em bases legadas. Ninguém sério armazena senha com SHA-256 puro. Provedores de identidade (Auth0, AWS Cognito, Firebase Auth) usam funções de custo ajustável nos bastidores.

#### Ameaça abordada
**T2 — Vazamento de banco de dados**. O modelo de ameaça é: o atacante *já tem* a tabela `usuarios` inteira e opera offline, em hardware especializado, testando bilhões de candidatos por segundo.

#### Conceito (teoria curta)
- Por que hash de propósito geral (SHA-256) é *rápido demais* para senha.
- Salt: impede rainbow tables e diferencia senhas idênticas.
- Pepper: valor secreto separado do banco; separa "quebra da base" de "quebra completa".
- Parâmetros de custo: memória, iterações, paralelismo (Argon2id).

#### Prática guiada

```javascript
// senha.mjs
import argon2 from 'argon2';

// Parâmetros alinhados à recomendação OWASP vigente
const OPCOES = {
  type: argon2.argon2id,
  memoryCost: 19456,   // 19 MiB
  timeCost: 2,         // 2 iterações
  parallelism: 1,
};

// CADASTRO — nunca armazenar a senha; armazenar o hash
async function cadastrar(senha) {
  const hash = await argon2.hash(senha, OPCOES);
  // hash já embute salt aleatório + parâmetros; guardar a string inteira
  return hash;
}

// LOGIN — verificar sem nunca decifrar (não há o que decifrar)
async function autenticar(hashArmazenado, senhaFornecida) {
  return argon2.verify(hashArmazenado, senhaFornecida);
}

// DEMONSTRAÇÃO
const hash = await cadastrar('senha-do-medico-2026');
console.log('Hash armazenado:', hash);
// $argon2id$v=19$m=19456,t=2,p=1$<salt-base64>$<hash-base64>

console.log('Senha correta:', await autenticar(hash, 'senha-do-medico-2026'));
console.log('Senha errada:', await autenticar(hash, 'chute-do-atacante'));

// MEDIR o custo — o valor absoluto depende do hardware
const inicio = performance.now();
await cadastrar('teste');
console.log(`Tempo por hash: ${(performance.now() - inicio).toFixed(0)}ms`);
// Em hardware de laboratório recente, os parâmetros mínimos OWASP (19 MiB, t=2)
// costumam render dezenas de ms (40-90ms). O NÚMERO não é o ponto — a ordem de
// grandeza frente ao SHA-256 é. Ver "calibração" abaixo.
```

**Calibração dos parâmetros (como a indústria realmente faz):**

A indústria não copia números de tabela — mede no hardware de produção e ajusta os parâmetros ao orçamento de latência (alvo típico de ~250ms por hash em servidor de autenticação). Suba `memoryCost` até atingir o alvo:

```javascript
// calibrar.mjs — encontrar parâmetros para ~250ms no SEU hardware
import argon2 from 'argon2';

for (const mem of [19456, 32768, 65536, 131072]) {  // 19, 32, 64, 128 MiB
  const t0 = performance.now();
  await argon2.hash('senha', { type: argon2.argon2id, memoryCost: mem, timeCost: 2, parallelism: 1 });
  const ms = (performance.now() - t0).toFixed(0);
  console.log(`memoryCost=${mem} (${mem/1024} MiB): ${ms}ms`);
}
// Escolher o maior memoryCost cujo tempo ainda cabe no orçamento de latência.
// 19456 é o PISO OWASP, não o alvo — em servidor dedicado, usa-se mais.
```

**Experimento didático — o custo é a defesa:**

```javascript
// comparar.mjs — demonstrar a diferença de ordem de grandeza
import crypto from 'node:crypto';
import argon2 from 'argon2';

// SHA-256: milhões por segundo (RUIM para senha)
let inicio = performance.now();
for (let i = 0; i < 100000; i++) {
  crypto.createHash('sha256').update('senha' + i).digest('hex');
}
console.log(`SHA-256: 100k hashes em ${(performance.now() - inicio).toFixed(0)}ms`);

// Argon2id: deliberadamente lento (BOM para senha)
inicio = performance.now();
await argon2.hash('senha', { type: argon2.argon2id, memoryCost: 19456, timeCost: 2 });
console.log(`Argon2id: 1 hash em ${(performance.now() - inicio).toFixed(0)}ms`);

// Conclusão: o atacante offline sofre a MESMA lentidão que protege o usuário.
```

#### Justificativa arquitetural
A lentidão do Argon2id não é defeito — é a defesa. Contra um atacante com a base em mãos, cada tentativa custa a ele o mesmo que custou ao servidor legítimo. Com SHA-256, o atacante testa bilhões/segundo; com Argon2id parametrizado, algumas dezenas por segundo por núcleo. A diferença é de ordens de grandeza — a fronteira entre "base vazada e senhas quebradas em horas" e "base vazada e senhas ainda seguras meses depois".

#### Conexão com a LGPD
Armazenar senha com hash inadequado, em incidente, pesa na avaliação do art. 48 (a comunicação precisa declarar as "medidas técnicas... utilizadas para a proteção"). Hash forte é atenuante documentável; SHA-256 puro é agravante.

> **Nota — hash forte não é tudo.** Argon2id protege a base **depois** de um vazamento, mas não impede tentativas de login **online**. Contra força bruta online (o atacante chuta senhas contra o endpoint de login em funcionamento), o controle é outro: throttling/lockout progressivo por conta e por IP, mais MFA (Encontro 8). Este é o mesmo ponto da categoria A07 do OWASP, tratada no Eixo 4 teórico. Em produção, o endpoint de login tem rate limiting — a oficina o adiciona junto com a sessão no Encontro 7.

#### Verificação
- [ ] Módulo de cadastro armazena hash Argon2id, nunca a senha.
- [ ] Login verifica corretamente senha certa e rejeita senha errada.
- [ ] Aluno mede o tempo no próprio hardware e explica por que a *ordem de grandeza* (não o número absoluto) frente ao SHA-256 é a defesa.
- [ ] Aluno calibra `memoryCost` para um alvo de latência e explica por que 19 MiB é piso, não alvo.
- [ ] Aluno explica o papel do salt (embutido) e o que um pepper adicionaria.
- [ ] Aluno distingue defesa contra ataque *offline* (hash forte) de defesa contra ataque *online* (rate limiting + MFA).

---

### 🔧 ENCONTRO 3 — Cifragem Autenticada na Aplicação (Camada 4, início)

**Objetivo**: cifrar campos sensíveis do prontuário na camada de aplicação, com AEAD, entendendo nonce e suas armadilhas.

#### Como a indústria faz hoje
Cifragem em nível de campo (*field-level* / *application-level encryption*) é o padrão para dados ultrassensíveis mesmo quando o banco já está cifrado em repouso — porque protege contra o DBA e contra o dump acidental. Empresas de saúde e fintech cifram campos como CPF, diagnóstico e dados de cartão na aplicação, antes de tocar o banco.

#### Ameaça abordada
**T4 — DBA ou insider malicioso**. Cifragem de volume não protege contra quem tem acesso legítimo de leitura ao banco. Cifragem de campo, com chave fora do banco, protege.

#### Conceito (teoria curta)
- AEAD em profundidade: `AES-256-GCM` e `XChaCha20-Poly1305`.
- A armadilha do nonce: em GCM, nonce repetido sob a mesma chave é catastrófico.
- Por que `XChaCha20-Poly1305` (nonce de 192 bits) tolera nonce aleatório sem risco prático.
- Associated Data: autenticar metadados sem cifrá-los.

#### Prática guiada

> **⚠️ ANTI-PADRÃO CONSCIENTE.** O código abaixo carrega a chave de um arquivo local para que os dados cifrados hoje ainda sejam legíveis amanhã (uma chave gerada em memória a cada execução tornaria todo dado persistido irrecuperável). Mas guardar a chave num arquivo ao lado do dado **está errado** — é como deixar a chave do cofre colada no cofre. Isto será corrigido no **Encontro 11**, quando a chave passa a ser uma DEK protegida por uma KEK que nunca sai do Vault. Mantenha este defeito em mente: ele é o gancho para o encontro de envelope encryption.

```javascript
// campo.mjs — cifragem de campo de prontuário
import sodium from 'libsodium-wrappers';
import fs from 'node:fs';
await sodium.ready;

// Chave de campo: carregada de arquivo local se existir; senão, gerada e salva.
// ⚠️ INSEGURO DE PROPÓSITO — chave ao lado do dado. Corrigido no Encontro 11.
const CHAVE_PATH = './.chave-campo-DEV';
let chaveCampo;
if (fs.existsSync(CHAVE_PATH)) {
  chaveCampo = sodium.from_base64(fs.readFileSync(CHAVE_PATH, 'utf8'));
} else {
  chaveCampo = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  fs.writeFileSync(CHAVE_PATH, sodium.to_base64(chaveCampo), { mode: 0o600 });
}

function cifrarCampo(textoClaro, dadosAssociados = '') {
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  const cifrado = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    sodium.from_string(textoClaro),
    sodium.from_string(dadosAssociados),  // ex.: id do paciente (autenticado, não cifrado)
    null,
    nonce,
    chaveCampo
  );
  // Persistir nonce + cifrado juntos (nonce não é secreto)
  return {
    nonce: sodium.to_base64(nonce),
    dado: sodium.to_base64(cifrado),
  };
}

function decifrarCampo({ nonce, dado }, dadosAssociados = '') {
  const claro = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.from_base64(dado),
    sodium.from_string(dadosAssociados),
    sodium.from_base64(nonce),
    chaveCampo
  );
  return sodium.to_string(claro);
}

// USO — cifrar o diagnóstico, autenticando o vínculo com o paciente
const registro = cifrarCampo(
  'CID F41.1 - Transtorno de ansiedade generalizada',
  'paciente:7781'   // associated data: se alguém trocar o registro de paciente, a auth falha
);
console.log('Armazenado no banco:', registro);

console.log('Decifrado:', decifrarCampo(registro, 'paciente:7781'));

// DEMONSTRAR: associated data protege contra troca de registro entre pacientes
try {
  decifrarCampo(registro, 'paciente:9999');  // paciente errado
} catch {
  console.log('✓ Tentativa de reatribuir registro a outro paciente foi detectada');
}
```

#### Justificativa arquitetural
Por que `XChaCha20-Poly1305` e não `AES-GCM` aqui? Porque o nonce estendido (192 bits) permite gerá-lo aleatoriamente sem manter contador — simplicidade operacional sem risco de colisão. Em cenário de altíssimo volume com hardware AES dedicado, AES-GCM seria preferível por performance, mas exigiria disciplina de nonce (contador). A escolha ilustra um trade-off real de engenharia: segurança operacional vs. performance de hardware.

O **associated data** (`paciente:7781`) é a peça sutil: ele amarra criptograficamente o registro ao paciente. Um insider que tente mover o diagnóstico cifrado de um paciente para outro no banco fará a verificação de autenticidade falhar — a integridade referencial passa a ser garantida pela própria cifra.

#### Verificação
- [ ] Campo de prontuário é cifrado antes de persistir; decifrado ao ler.
- [ ] Aluno explica por que o nonce pode ser público mas nunca deve repetir.
- [ ] Aluno demonstra que associated data protege contra reatribuição de registro.
- [ ] Aluno articula o modelo de ameaça: contra quem a cifragem de campo protege que a de volume não protegeria.

---

> **Continuação nos Encontros 4–12** — desenvolvidos na Parte C (continuação), cobrindo criptografia assimétrica e híbrida, TLS 1.3, PKI, autenticação e MFA, mTLS entre serviços, HashiCorp Vault, envelope encryption e a integração final.

*(documento continua)*

---

### 🔧 ENCONTRO 4 — Criptografia Assimétrica e Esquema Híbrido

**Objetivo**: implementar troca de mensagem cifrada ponta a ponta entre médico e paciente, entendendo por que cifras assimétricas não cifram o dado diretamente.

#### Como a indústria faz hoje
Nenhum sistema cifra megabytes com RSA — é lento demais. O padrão universal (TLS, PGP, S/MIME, Signal, envelope encryption de cloud) é o **esquema híbrido**: cifra assimétrica protege apenas uma chave simétrica; a chave simétrica protege o dado. O `crypto_box` do libsodium implementa isso pronto (Curve25519 + XSalsa20-Poly1305).

#### Ameaça abordada
Confidencialidade ponta a ponta — mensagem médico↔paciente que nem o servidor consegue ler (modelo de mensageria segura).

#### Conceito (teoria curta)
- Par de chaves: pública (compartilhável) e privada (secreta).
- Por que cifra assimétrica é cara e usada só para trocar chave / assinar.
- Esquema híbrido: gerar DEK aleatória → cifrar dado com DEK (AEAD) → cifrar DEK com chave pública.
- Comparação RSA-3072 × ECDSA P-256 × Ed25519 / X25519.

#### Prática guiada

```javascript
// hibrido.mjs — troca segura médico <-> paciente
import sodium from 'libsodium-wrappers';
await sodium.ready;

// Cada parte tem um par de chaves (gerado uma vez, chave privada nunca sai do dono)
const medico = sodium.crypto_box_keypair();    // { publicKey, privateKey }
const paciente = sodium.crypto_box_keypair();

// MÉDICO cifra para o PACIENTE
// crypto_box faz o esquema híbrido internamente:
//   deriva segredo compartilhado (X25519) + cifra autenticada (XSalsa20-Poly1305)
function cifrarPara(mensagem, chavePublicaDestino, chavePrivadaRemetente) {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const cifrado = sodium.crypto_box_easy(
    sodium.from_string(mensagem),
    nonce,
    chavePublicaDestino,
    chavePrivadaRemetente
  );
  return { nonce: sodium.to_base64(nonce), dado: sodium.to_base64(cifrado) };
}

function decifrarDe({ nonce, dado }, chavePublicaRemetente, chavePrivadaDestino) {
  const claro = sodium.crypto_box_open_easy(
    sodium.from_base64(dado),
    sodium.from_base64(nonce),
    chavePublicaRemetente,
    chavePrivadaDestino
  );
  return sodium.to_string(claro);
}

// Fluxo
const msg = cifrarPara('Resultado do exame: tudo normal.',
                        paciente.publicKey, medico.privateKey);
console.log('Trafega cifrado:', msg);

// Paciente decifra com SUA chave privada + chave pública do médico
console.log('Paciente lê:', decifrarDe(msg, medico.publicKey, paciente.privateKey));

// O SERVIDOR, que só vê `msg`, não consegue ler sem uma das chaves privadas.
```

#### Justificativa arquitetural
`crypto_box` combina três coisas que, feitas à mão, seriam três oportunidades de erro: acordo de chave (X25519 Diffie-Hellman), derivação de chave simétrica e cifragem autenticada. Ao usar a construção de alto nível, o aluno obtém confidencialidade *e* proteção de integridade sem tocar em nenhum primitivo.

> **Precisão criptográfica importante — autenticação simétrica ≠ assinatura.** `crypto_box` autentica a mensagem com uma chave **compartilhada**, derivada do Diffie-Hellman entre o par. Isso garante que a mensagem veio de **um dos dois** detentores das chaves do par e não foi adulterada por um terceiro externo. Mas **não** oferece não-repúdio: como o paciente também detém a chave simétrica derivada, ele *poderia* forjar uma mensagem "do médico" para si mesmo. Portanto, é incorreto dizer "só o médico poderia ter cifrado isto". Para autenticidade de origem verificável por terceiros (não-repúdio), a ferramenta é a **assinatura digital** (`crypto_sign`, Ed25519) — onde só o detentor da chave privada consegue assinar, e qualquer um verifica com a pública. Esta é exatamente a distinção entre **MAC** (autenticação simétrica, sem não-repúdio) e **assinatura** (autenticação assimétrica, com não-repúdio) vista no Eixo 4 teórico. Um bom exercício de extensão: reimplementar a troca com `crypto_sign` sobre o conteúdo e discutir o que muda.

**Ligação com o mercado**: o esquema híbrido de `crypto_box` (X25519 para acordar chave + cifra simétrica autenticada) é o **bloco básico** sobre o qual protocolos de mensageria fim-a-fim são construídos. Note que sistemas como o Signal vão muito além disto: adicionam *forward secrecy* e o *Double Ratchet* (chaves que evoluem a cada mensagem), que `crypto_box` sozinho não provê. A semelhança está no primitivo de base, não no protocolo completo — não confundir o tijolo com o edifício. Envelope encryption de cloud e criptografia de e-mail (PGP/age) também partem do mesmo tijolo híbrido.

#### Verificação
- [ ] Mensagem cifrada por um par e decifrada apenas pelo destinatário correto.
- [ ] Aluno explica por que o servidor intermediário não consegue ler.
- [ ] Aluno justifica por que não se cifra o dado diretamente com a chave assimétrica.
- [ ] Aluno distingue autenticação simétrica (`crypto_box`, sem não-repúdio) de assinatura (`crypto_sign`, com não-repúdio) e diz qual usar quando.
- [ ] Aluno compara tamanhos/velocidade de X25519 vs. RSA para o mesmo nível de segurança.

---

### 🔧 ENCONTRO 5 — TLS 1.3 e a Camada de Borda

**Objetivo**: colocar o MedSeguro atrás de um proxy reverso com TLS 1.3, HSTS e redirecionamento — a primeira camada que o mundo real exige.

#### Como a indústria faz hoje
Aplicações modernas raramente terminam TLS no próprio código — delegam a um proxy reverso (Nginx, Caddy, Traefik, Envoy) ou a um balanceador de carga gerenciado (ALB, Cloud Load Balancing). A aplicação Node fica atrás, falando HTTP em rede interna confiável. Certificados são automatizados via ACME (Let's Encrypt) ou emitidos por CA interna.

#### Ameaça abordada
**T1 — Interceptação de tráfego**. Sem TLS, credenciais e prontuários trafegam em claro; qualquer ponto da rede lê tudo.

#### Conceito (teoria curta)
- O que TLS 1.3 mudou: handshake 1-RTT, PFS obrigatório, algoritmos legados removidos.
- Terminação TLS na borda vs. TLS fim-a-fim até a aplicação.
- HSTS: forçar HTTPS e evitar downgrade/SSL-stripping.
- OCSP stapling: verificar revogação sem o cliente consultar a CA.

#### Prática guiada

```yaml
# docker-compose.yml — MedSeguro (cresce ao longo da oficina)
# Já inclui os serviços que os encontros seguintes exigem (Redis, Postgres, Vault),
# para evitar retrabalho. Cada um entra em uso no seu encontro.
services:
  app:
    build: .
    expose: ["3000"]        # HTTP interno, não exposto ao host
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379          # sessão (Encontro 7)
      - VAULT_ADDR=http://vault:8200          # segredos (Encontro 10)
    depends_on: [redis, postgres]

  caddy:                     # borda TLS (Encontro 5)
    image: caddy:2-alpine
    ports: ["443:443", "80:80"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

  redis:                     # store de sessão (Encontro 7)
    image: redis:7-alpine
    expose: ["6379"]

  postgres:                  # banco (Encontros 10-11)
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=medseguro
      - POSTGRES_PASSWORD=${DB_ADMIN_PASS}
    expose: ["5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  vault:                     # cofre (Encontros 10-11) — modo dev; ver nota do Encontro 10
    image: hashicorp/vault
    cap_add: [IPC_LOCK]
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=dev-root
    expose: ["8200"]

volumes:
  caddy_data:
  caddy_config:
  pgdata:
```

```
# Caddyfile — TLS 1.3, HSTS, headers de segurança
medseguro.local {
    reverse_proxy app:3000

    header {
        # HSTS: 1 ano, incluir subdomínios
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        # remover header que revela tecnologia (higiene, não segurança — ver nota)
        -Server
    }
    # CSP fica FORA daqui de propósito — ver nota sobre CSP abaixo.

    tls {
        protocols tls1.3
    }
}
```

> **Sobre CSP.** Uma linha genérica `Content-Security-Policy "default-src 'self'"` **quebra** praticamente qualquer front-end real (bloqueia estilos/scripts inline, fontes e imagens externas). CSP eficaz exige política pensada para a aplicação, idealmente com `nonce` por resposta — o que conecta diretamente à mitigação de XSS do Eixo 3. Por isso CSP não entra como "uma linha no proxy": ou se dedica tempo a construí-la corretamente (extensão opcional), ou se mantém no plano conceitual. Copiar a linha genérica ensina que "CSP atrapalha" — o pior resultado possível.

> **Sobre o header `Server`.** Removê-lo é **higiene**, não controle de segurança: fingerprinting moderno não depende dele (usa comportamento de resposta, ordem de headers, timing). Não superestime o valor deste item.

**Verificação da configuração TLS:**

```bash
# testar a configuração TLS resultante (em laboratório)
docker run --rm -ti drwetter/testssl.sh https://medseguro.local

# esperado: nota A, TLS 1.3, PFS, sem protocolos legados,
# HSTS presente, sem cipher suites fracas
```

#### Justificativa arquitetural
Por que terminar TLS na borda e não no Node? Separação de responsabilidades: o proxy é especializado, atualiza cipher suites sem tocar o código da aplicação, gerencia certificados automaticamente (ACME) e absorve ataques de camada de transporte. A aplicação foca em lógica de negócio. É o padrão de mercado — a aplicação quase nunca fala TLS diretamente com o cliente em produção.

> **Sobre OCSP stapling.** O Caddy faz stapling **automaticamente para certificados de CAs públicas que expõem endpoint OCSP** (ex.: Let's Encrypt). No MedSeguro em `medseguro.local`, o certificado é local/interno e **não** tem responder OCSP — logo, stapling não se aplica neste ambiente. Trate OCSP como **conceito** (revogação em tempo real, evitando que o cliente consulte a CA) e não como item prático a marcar aqui. Montar um responder OCSP na PKI interna é possível, mas está fora do escopo de tempo desta oficina.

**Nota sobre confiança da rede interna**: entre proxy e app, o tráfego é HTTP em claro. Isso só é aceitável se a rede interna for confiável (mesmo host, rede Docker isolada). Quando não é — múltiplos nós, nuvem compartilhada — entra o mTLS do Encontro 9.

#### Verificação
- [ ] MedSeguro acessível apenas via HTTPS; HTTP redireciona.
- [ ] `testssl.sh` retorna nota A com TLS 1.3.
- [ ] HSTS e headers de segurança presentes.
- [ ] Aluno explica por que terminar TLS na borda é o padrão de produção.
- [ ] Aluno explica por que OCSP stapling **não** se aplica ao certificado interno deste ambiente (conceito vs. prática).

---

### 🔧 ENCONTRO 6 — PKI Privada e Certificados

**Objetivo**: montar cadeia de confiança de três níveis (raiz → intermediária → folha) que sustentará o mTLS do Encontro 9.

#### Como a indústria faz hoje
Comunicação interna entre serviços não usa CAs públicas — usa **PKI interna**. Ferramentas como `step-ca` (Smallstep), `cfssl` (Cloudflare), Vault PKI e `cert-manager` (Kubernetes) emitem e renovam certificados internos automaticamente. A raiz fica offline; intermediárias operacionais emitem em volume.

#### Ameaça abordada
Fundação para **T7** — estabelecer identidade verificável de cada serviço.

#### Conceito (teoria curta)
- Cadeia de confiança: por que três níveis, não um.
- Raiz offline vs. intermediária online — contenção de comprometimento.
- CSR, SAN, extensões (basicConstraints, keyUsage, EKU).
- Revogação: CRL vs. OCSP.

#### Prática guiada

```bash
# --- CA RAIZ (offline, autoassinada) ---
openssl genrsa -aes256 -out root-ca.key 4096      # chave protegida por senha
openssl req -x509 -new -key root-ca.key -sha256 -days 3650 \
  -out root-ca.crt \
  -subj "/C=BR/O=MedSeguro/CN=MedSeguro Root CA"

# --- CA INTERMEDIÁRIA (operacional) ---
openssl genrsa -out intermediate.key 4096
openssl req -new -key intermediate.key \
  -out intermediate.csr \
  -subj "/C=BR/O=MedSeguro/CN=MedSeguro Intermediate CA"

# raiz assina a intermediária, com restrição de que é CA (pathlen:0)
openssl x509 -req -in intermediate.csr \
  -CA root-ca.crt -CAkey root-ca.key -CAcreateserial \
  -out intermediate.crt -days 1825 -sha256 \
  -extfile <(echo "basicConstraints=critical,CA:TRUE,pathlen:0
keyUsage=critical,keyCertSign,cRLSign")

# --- CERTIFICADO-FOLHA (serviço de prontuário) ---
openssl genrsa -out prontuario.key 2048
openssl req -new -key prontuario.key \
  -out prontuario.csr \
  -subj "/C=BR/O=MedSeguro/CN=prontuario.medseguro.internal"

# intermediária assina a folha, com SAN
# NOTA: serverAuth+clientAuth no MESMO cert é um ATALHO (ver nota abaixo)
openssl x509 -req -in prontuario.csr \
  -CA intermediate.crt -CAkey intermediate.key -CAcreateserial \
  -out prontuario.crt -days 90 -sha256 \
  -extfile <(echo "subjectAltName=DNS:prontuario.medseguro.internal
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth,clientAuth")

# --- VERIFICAR a cadeia ---
cat intermediate.crt root-ca.crt > chain.crt
openssl verify -CAfile chain.crt prontuario.crt
# esperado: prontuario.crt: OK
```

> **Atalho consciente — EKU duplo.** Emitir o certificado com `serverAuth` **e** `clientAuth` permite que o mesmo serviço atue como servidor (recebe conexões) e como cliente (chama outros serviços) no mTLS do Encontro 9 — conveniente para a oficina. Mas isto contraria o menor privilégio: em arquitetura zero-trust rigorosa, identidade de servidor e de cliente são certificados **distintos**, para que o comprometimento de um papel não conceda o outro. Mantemos o atalho pelo tempo; saiba que a prática madura separa os dois.

#### Justificativa arquitetural
A separação raiz/intermediária é gestão de risco pura. Se a intermediária (que fica online, emitindo) for comprometida, a raiz — guardada offline — revoga a intermediária inteira e uma nova assume. A chave raiz, o ponto de confiança última, quase nunca é manipulada, minimizando sua janela de exposição. É por isso que **certificados-folha têm validade curta** (90 dias no exemplo, como o Let's Encrypt): renovação frequente e automatizada reduz o valor de uma chave roubada.

**Ligação com o mercado**: em produção, ninguém roda esses comandos `openssl` à mão. `step-ca` e Vault PKI (Encontro 10) automatizam tudo isso. Fazer manualmente uma vez, aqui, é para *entender* o que a automação faz por baixo.

#### Verificação
- [ ] Cadeia de três níveis montada; `openssl verify` retorna OK.
- [ ] Certificado-folha tem SAN e EKU corretos.
- [ ] Aluno explica por que a raiz deve ficar offline.
- [ ] Aluno justifica a validade curta do certificado-folha.

---

### 🔧 ENCONTRO 7 — Autenticação: Sessão, JWT e Seus Perigos

**Objetivo**: implementar gerenciamento de sessão seguro e JWT corretamente, conhecendo as armadilhas que geram vulnerabilidades reais.

#### Como a indústria faz hoje
Há duas escolas: **sessão com estado** (ID opaco no cookie, dados no servidor/Redis) e **token sem estado** (JWT). Sistemas grandes frequentemente combinam: JWT de vida curta para acesso + refresh token com estado para renovação. A escolha errada de armazenamento de JWT (localStorage) é uma das causas mais comuns de roubo de sessão via XSS.

#### Ameaça abordada
**T5 (parcial)** — roubo de sessão; e as armadilhas específicas de JWT (`alg:none`, chave fraca, armazenamento inseguro).

#### Conceito (teoria curta)
- Sessão com estado vs. JWT sem estado: trade-offs (revogação, escala, tamanho).
- Cookies seguros: `HttpOnly`, `Secure`, `SameSite`.
- JWT: estrutura, assinatura, e os três erros clássicos.
- Por que JWT em `localStorage` é vulnerável a XSS.

#### Prática guiada

```javascript
// jwt-seguro.mjs — JWT feito corretamente com a lib `jose`
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';

// Chave HMAC de alta entropia (256 bits).
// ⚠️ Gerada aqui só para demonstração: como muda a cada restart, TODOS os JWT
// emitidos são invalidados ao reiniciar. Em produção a chave é ESTÁVEL e vem do
// cofre (Encontro 10, KV: JWT_KEY) — não se gera chave de assinatura em memória.
const chave = crypto.randomBytes(32);

// EMITIR — algoritmo EXPLÍCITO, expiração curta
async function emitirToken(usuario) {
  return new SignJWT({ papel: usuario.papel })
    .setProtectedHeader({ alg: 'HS256' })   // explícito — nunca aceitar 'none'
    .setSubject(usuario.id)
    .setIssuedAt()
    .setIssuer('medseguro')
    .setAudience('medseguro-api')
    .setExpirationTime('15m')                // vida curta
    .sign(chave);
}

// VERIFICAR — validar algoritmo, emissor, audiência (não confiar cegamente)
async function verificarToken(token) {
  const { payload } = await jwtVerify(token, chave, {
    algorithms: ['HS256'],                   // rejeita qualquer outro alg
    issuer: 'medseguro',
    audience: 'medseguro-api',
  });
  return payload;
}

const token = await emitirToken({ id: 'medico-42', papel: 'medico' });
console.log('Token:', token);
console.log('Verificado:', await verificarToken(token));
```

```javascript
// sessao-cookie.mjs — cookie de sessão seguro (Express) COM store externo
import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

// STORE EXTERNO (Redis) — obrigatório em produção.
// O default de express-session é MemoryStore, que a PRÓPRIA documentação
// declara imprópria para produção: vaza memória, não escala além de 1 processo,
// perde sessões no restart. Como o MedSeguro vira multiserviço no Encontro 9,
// sessão em memória de um processo seria incoerente com a arquitetura.
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const app = express();
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,   // do cofre, não hardcoded
  name: 'medseguro.sid',                // não usar o nome default
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // inacessível a document.cookie -> mitiga roubo por XSS
    secure: true,      // só trafega em HTTPS
    sameSite: 'strict',// mitiga CSRF
    maxAge: 15 * 60 * 1000,
  },
}));
```

```javascript
// rate-limit-login.mjs — proteção contra brute force ONLINE (complementa o Encontro 2)
import rateLimit from 'express-rate-limit';

// O hash Argon2id protege a base APÓS vazamento (ataque offline).
// Isto protege o endpoint de login contra tentativas ONLINE.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,   // janela de 15 min
  max: 10,                     // 10 tentativas por janela por IP
  standardHeaders: true,
  legacyHeaders: false,
  // Em produção: combinar limite por IP com lockout progressivo por CONTA,
  // para não permitir credential stuffing distribuído nem travar por DoS.
});

app.post('/login', limiteLogin, /* handler de autenticação */);
```

#### Justificativa arquitetural
Por que `HttpOnly` importa tanto? Porque é a diferença entre "XSS rouba a sessão" e "XSS não alcança o cookie". Como visto no Eixo 3 (Stored XSS no campo observações), um único ponto de injeção pode exfiltrar sessões de todos os usuários se o cookie for legível por JavaScript. `HttpOnly` fecha essa porta — mitigação adjacente, não raiz, mas decisiva.

Por que store externo (Redis) e não o default? Porque o MemoryStore do `express-session` é anti-padrão de produção — e a incoerência ficaria gritante no Encontro 9, quando o sistema vira multiserviço: sessão presa à memória de um processo não sobrevive a múltiplas instâncias. Aqui a oficina pratica o que prega ("como a indústria faz"): estado de sessão compartilhado em store dedicado.

Por que declarar o algoritmo explicitamente na verificação do JWT? Porque a vulnerabilidade clássica `alg:none` e a confusão de algoritmo (aceitar RS256 mas verificar como HS256 usando a chave pública como segredo HMAC) são exploradas justamente quando o verificador confia no header do próprio token. A `jose` obriga a declarar os algoritmos aceitos — o design da biblioteca previne a classe de bug.

#### Verificação
- [ ] JWT emitido com `exp` curto e verificado com algoritmo/emissor/audiência explícitos.
- [ ] Sessão usa store externo (Redis), não MemoryStore.
- [ ] Cookie de sessão com `HttpOnly`, `Secure`, `SameSite`.
- [ ] Endpoint de login tem rate limiting; aluno distingue defesa online (rate limit) de offline (hash forte).
- [ ] Aluno explica por que JWT em `localStorage` é perigoso e onde armazenar em vez disso.
- [ ] Aluno descreve os três erros clássicos de JWT.

---

### 🔧 ENCONTRO 8 — MFA: TOTP e WebAuthn/Passkeys

**Objetivo**: adicionar segundo fator para médicos — TOTP (base instalada) e WebAuthn/Passkey (estado da arte).

#### Como a indústria faz hoje
MFA deixou de ser opcional para acesso a dado sensível. TOTP (Google Authenticator, Authy) é o piso; **WebAuthn/Passkeys** é o padrão emergente — resistente a phishing por construção, adotado por Google, Apple, Microsoft, GitHub. SMS como segundo fator está em retirada (NIST desaconselha).

#### Ameaça abordada
**T5 — Comprometimento de credencial**. Senha vazada/phishada não basta ao atacante se há segundo fator; WebAuthn resiste até a phishing em tempo real.

#### Conceito (teoria curta)
- Os três fatores; por que dois do mesmo tipo não é MFA.
- TOTP: segredo compartilhado + tempo; vulnerável a phishing em tempo real.
- WebAuthn: criptografia assimétrica; nada para o phishing capturar.
- Hierarquia de robustez: WebAuthn > TOTP > push > SMS.

#### Prática guiada

```javascript
// totp.mjs — segundo fator TOTP (otplib 13.x — ver nota de versão no Encontro 1)
import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';

// Janela de tolerância: verify aceita o passo de tempo atual e, com `window`,
// passos adjacentes (cobre relógios levemente dessincronizados). window=1 é o
// equilíbrio usual; ampliar melhora usabilidade mas aumenta a quantidade de
// códigos válidos simultaneamente.
const JANELA = 1;

// SETUP (uma vez por usuário) — gerar segredo e QR para o app autenticador
function configurarTOTP(emailMedico) {
  const secret = generateSecret();   // guardar CIFRADO no banco (ver campo.mjs)
  const otpauth = generateURI({ secret, label: emailMedico, issuer: 'MedSeguro' });
  return { secret, otpauth };
}

// LOGIN — validar o código de 6 dígitos.
// ⚠️ Em otplib 13.x, verify() é ASSÍNCRONA e retorna um OBJETO { valid, delta, ... },
// não um booleano — tratar o retorno como boolean seria sempre-verdadeiro (bug).
async function validarTOTP(secret, codigoDigitado) {
  const r = await verify({ token: codigoDigitado, secret, window: JANELA });
  return r.valid;
}

// ⚠️ TOTP não impede REPLAY por si só: o mesmo código vale durante toda a janela.
// Em produção, registrar o último código aceito por usuário e recusar reuso
// dentro da janela — senão um código capturado (shoulder surfing, proxy de
// phishing) pode ser reapresentado nos segundos seguintes.
const ultimoCodigoUsado = new Map();   // usuarioId -> codigo (exemplo simplificado)
async function validarSemReplay(usuarioId, secret, codigo) {
  if (ultimoCodigoUsado.get(usuarioId) === codigo) return false;  // já usado
  const ok = await validarTOTP(secret, codigo);
  if (ok) ultimoCodigoUsado.set(usuarioId, codigo);
  return ok;
}

const { secret, otpauth } = configurarTOTP('medico@medseguro.local');
console.log('QR (escanear no app):');
console.log(await qrcode.toString(otpauth, { type: 'terminal', small: true }));
// médico escaneia, app gera códigos de 30s, login valida
```

> **Nota de compatibilidade (otplib).** A API do `otplib` mudou entre versões maiores: até a 12.x usava um objeto `authenticator` (`authenticator.generateSecret()`, `.keyuri()`, `.verify()` **síncrona** retornando boolean); a 13.x usa **exports nomeados** (`generateSecret`, `generateURI`, `verify`) e `verify()` é **assíncrona** e retorna `{ valid, delta, ... }`. O código acima é para a **13.x**. Se o `package.json` fixar `otplib@^12`, use a API antiga. Fixe a versão (ver Encontro 1) para evitar que uma atualização quebre este encontro.

> **⚠️ WebAuthn EXIGE contexto seguro — use `localhost`, não `medseguro.local`.** O navegador só habilita a WebAuthn API em *secure context*: HTTPS com certificado **confiável** ou a origem `localhost`. O domínio interno `medseguro.local` usa certificado da PKI da oficina (Encontro 6), que **não** está no armazenamento de confiança do navegador — e a oficina, corretamente, proíbe instalar a CA raiz no SO. Resultado: `navigator.credentials.create()` falharia. Por isso, **este exercício roda em `localhost`** (`rpID = 'localhost'`, `origin = 'http://localhost:3000'`), que é secure context sem exigir certificado confiável. Em produção real, o `rpID` é o domínio público com certificado de CA pública.

```javascript
// webauthn.mjs — esqueleto de registro/autenticação Passkey (servidor)
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

// localhost é secure context — funciona sem certificado confiável (ver nota acima)
const rpName = 'MedSeguro';
const rpID = 'localhost';
const origin = 'http://localhost:3000';

// REGISTRO — servidor gera desafio; autenticador do médico assina
async function iniciarRegistro(usuario) {
  return generateRegistrationOptions({
    rpName, rpID,
    userID: new TextEncoder().encode(usuario.id),
    userName: usuario.email,
    // 'none' evita lidar com verificação de atestado — pragmático para a oficina.
    // Em saúde, onde se pode querer garantir que o autenticador é um dispositivo
    // homologado (não software falso), a atestação ('direct'/'enterprise') importa;
    // aqui abrimos mão dela conscientemente pela simplicidade.
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',       // exige passkey descobrível
      userVerification: 'required',  // exige biometria/PIN — coerente com acesso a dado sensível
    },
  });
}
// O navegador chama navigator.credentials.create() com essas opções;
// o par de chaves nasce no dispositivo, a privada NUNCA sai dele.
// verifyRegistrationResponse() confere a assinatura e guarda a chave pública.

// AUTENTICAÇÃO — servidor manda desafio; autenticador assina com a chave privada
async function iniciarLogin() {
  return generateAuthenticationOptions({ rpID, userVerification: 'required' });
}
// Nada que o phishing intercepte serve em outro site: a origem é assinada.
```

O bloco acima é o **lado servidor**. Para o fluxo ser de fato ponta a ponta, o **lado cliente** (navegador) consome essas opções com a API `navigator.credentials`. Esqueleto do browser (registro e login):

```javascript
// webauthn-client.mjs — lado NAVEGADOR (roda no browser, não no Node)
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

// REGISTRO: busca opções no servidor -> autenticador cria o par -> devolve ao servidor
async function registrar() {
  const opts = await fetch('/webauthn/registro/inicio').then((r) => r.json());
  const resp = await startRegistration(opts);   // dispara biometria/PIN; chave privada nasce e fica no dispositivo
  await fetch('/webauthn/registro/fim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resp),
  });
  // No servidor, verifyRegistrationResponse() confere a assinatura e guarda a chave PÚBLICA.
}

// LOGIN: busca desafio -> autenticador assina -> servidor verifica
async function entrar() {
  const opts = await fetch('/webauthn/login/inicio').then((r) => r.json());
  const resp = await startAuthentication(opts);  // assina o desafio vinculado à ORIGEM
  const r = await fetch('/webauthn/login/fim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resp),
  });
  return r.ok;
  // verifyAuthenticationResponse() no servidor confere a assinatura contra a chave pública guardada.
}
```

> **Sobre "esqueleto".** Chamamos de esqueleto porque os handlers HTTP (`/webauthn/...`), a persistência da chave pública e o transporte do `challenge` ficam a cargo do grupo — o essencial criptográfico (geração de opções no servidor, criação/assinatura no autenticador, verificação no servidor) está completo nos dois lados. Requer `@simplewebauthn/browser` no front-end, além do `@simplewebauthn/server` no back-end.

> **Nota sobre `required` vs. `preferred`.** Usamos `userVerification: 'required'` porque o acesso é a dado pessoal sensível (saúde) — coerente com o modelo de ameaça declarado. `'preferred'` permitiria *downgrade* silencioso quando o autenticador não suportasse verificação, enfraquecendo a garantia sem avisar. O custo é excluir autenticadores mais antigos; é uma decisão de trade-off que o grupo deve saber justificar.

#### Justificativa arquitetural
Por que WebAuthn é superior a TOTP? No TOTP, o segredo é compartilhado; se o médico digitar o código em um site de phishing convincente, o atacante o repassa ao site real em segundos. No WebAuthn, o autenticador assina um desafio *vinculado à origem* — a assinatura gerada para `phishing-medseguro.com` é inútil em `localhost`/no domínio legítimo. A resistência a phishing é uma propriedade *do protocolo*, não da atenção do usuário. Por isso o mercado migra para passkeys.

**Onde cada um cabe**: TOTP continua útil como fallback e para base instalada que já usa apps autenticadores. WebAuthn é o alvo para acesso privilegiado (médicos, administradores). A oficina implementa ambos porque a realidade de produção convive com ambos durante a transição.

#### Verificação
- [ ] TOTP funcional: QR gerado, código validado; segredo TOTP armazenado cifrado.
- [ ] TOTP recusa replay do mesmo código dentro da janela; aluno explica por quê.
- [ ] WebAuthn roda em `localhost` (secure context) com registro e autenticação funcionais em ambos os lados (servidor + navegador).
- [ ] Aluno explica por que `medseguro.local` não serviria e por que `required` foi escolhido.
- [ ] Aluno explica por que WebAuthn resiste a phishing e TOTP não.
- [ ] Aluno justifica por que SMS é o fator mais fraco.

---

### 🔧 ENCONTRO 9 — mTLS Entre Microserviços

**Objetivo**: autenticar a comunicação prontuário↔prescrição por certificados mútuos, usando a PKI do Encontro 6.

#### Como a indústria faz hoje
Em arquiteturas de microserviços e *zero-trust*, serviços não confiam uns nos outros por estarem "na mesma rede". Cada chamada é autenticada por **mTLS** — ambos os lados apresentam certificado. Service meshes (Istio, Linkerd) automatizam isso; identidades de carga de trabalho (SPIFFE/SPIRE) padronizam a emissão. É a materialização do princípio "nunca confie, sempre verifique".

#### Ameaça abordada
**T7 — Serviço interno falsificado**. Um atacante que ganhe posição na rede interna (movimentação lateral) não consegue se passar pelo serviço de prescrição sem o certificado válido.

#### Conceito (teoria curta)
- TLS normal: cliente verifica servidor. mTLS: ambos se verificam.
- Identidade de carga de trabalho (workload identity).
- Por que "rede interna confiável" é premissa perigosa (zero-trust).

#### Prática guiada

```javascript
// servico-prontuario.mjs — servidor que EXIGE certificado de cliente
import https from 'node:https';
import fs from 'node:fs';

const opcoes = {
  key: fs.readFileSync('prontuario.key'),
  cert: fs.readFileSync('prontuario.crt'),
  ca: fs.readFileSync('chain.crt'),        // confia na cadeia MedSeguro
  requestCert: true,                        // EXIGE cert do cliente
  rejectUnauthorized: true,                 // rejeita quem não apresentar válido
};

https.createServer(opcoes, (req, res) => {
  // 1) Confirmar que o TLS mútuo autorizou o par (não confiar só no getPeerCertificate)
  if (!req.client.authorized) {
    res.writeHead(401);
    return res.end('Certificado de cliente ausente ou inválido');
  }
  const cert = req.socket.getPeerCertificate();

  // 2) Autorizar pela identidade do SAN, NÃO pelo CN.
  //    O Eixo 2 já ensinou: CN foi substituído por SAN para identificar hosts.
  //    Basear autorização no CN repetiria um padrão que a própria disciplina
  //    classificou como obsoleto. Extraímos os DNS names do SAN.
  const sans = (cert.subjectaltname || '')       // ex.: "DNS:prescricao.medseguro.internal"
    .split(',')
    .map((s) => s.trim().replace(/^DNS:/, ''));

  const AUTORIZADOS = new Set(['prescricao.medseguro.internal']);
  if (!sans.some((nome) => AUTORIZADOS.has(nome))) {
    res.writeHead(403);
    return res.end('Serviço não autorizado');
  }

  res.writeHead(200);
  res.end(JSON.stringify({ prontuario: 'dados do paciente...' }));
}).listen(8443, () => console.log('Prontuário (mTLS) na 8443'));
```

```javascript
// servico-prescricao.mjs — cliente que se AUTENTICA com certificado
import https from 'node:https';
import fs from 'node:fs';

const opcoes = {
  hostname: 'prontuario.medseguro.internal',
  port: 8443,
  path: '/paciente/7781',
  method: 'GET',
  key: fs.readFileSync('prescricao.key'),   // MINHA chave/cert (cliente)
  cert: fs.readFileSync('prescricao.crt'),
  ca: fs.readFileSync('chain.crt'),
};

https.request(opcoes, (res) => {
  let corpo = '';
  res.on('data', (c) => (corpo += c));
  res.on('end', () => console.log('Resposta autenticada:', corpo));
}).end();

// Cliente SEM certificado, ou com cert de outra CA, é rejeitado no handshake.
```

> **Nota de laboratório — resolução do nome `.internal`.** O `hostname` acima (`prontuario.medseguro.internal`) precisa **resolver** e **casar com o SAN** do certificado do servidor. No Compose, o DNS interno resolve nomes de serviço automaticamente. Se você rodar os dois processos direto na máquina (sem contêiner), esse nome não existe no DNS: use `127.0.0.1` em `hostname` e force o casamento do SAN com `servername: 'prontuario.medseguro.internal'` (SNI). Em último caso, para depuração local, `checkServerIdentity: () => undefined` desliga a verificação de nome do **servidor** — mas isto **só** para laboratório: em produção a verificação do nome do servidor é parte da segurança e não deve ser desabilitada. (A autenticação do cliente pela app — o objeto deste encontro — permanece intacta em qualquer caso.)

#### Justificativa arquitetural
mTLS resolve o problema que TLS comum deixa aberto: no TLS normal, o servidor prova quem é, mas qualquer cliente conecta. No mTLS, o servidor de prontuário só responde a serviços que apresentem certificado emitido pela CA interna — e ainda decide autorização pela identidade (o **SAN**) do certificado. Um atacante com acesso à rede interna, mas sem a chave privada de um serviço legítimo, não consegue nem estabelecer a conexão.

> **Coerência com o Eixo 2**: a autorização usa o **SAN**, não o CN. O CN foi substituído pelo SAN para identificação de host justamente porque era ambíguo e sobrecarregado; usá-lo para autorização repetiria um padrão obsoleto. Em ambientes de service mesh, a identidade vai além: usa-se **SPIFFE ID** (um URI como `spiffe://medseguro/prescricao`) no SAN do tipo URI, padronizando identidade de carga de trabalho independente de DNS.

**Ligação com o mercado**: fazer mTLS "na mão" como aqui é didático. Em produção, service meshes (Istio, Linkerd) injetam sidecars que fazem mTLS transparente entre todos os serviços, com rotação automática de certificados de vida curtíssima (horas). SPIFFE/SPIRE padroniza a identidade. Entender o mecanismo cru aqui permite compreender o que o mesh automatiza.

#### Verificação
- [ ] Prescrição acessa Prontuário com certificado válido; conexão estabelecida.
- [ ] Cliente sem certificado (ou de outra CA) é rejeitado no handshake.
- [ ] Autorização feita pelo **SAN** (não CN); `req.client.authorized` verificado.
- [ ] Aluno explica por que autorizar por CN repetiria um padrão obsoleto (ligação Eixo 2).
- [ ] Aluno explica por que "rede interna confiável" é premissa perigosa.

---

### 🔧 ENCONTRO 10 — Gestão de Segredos com HashiCorp Vault

**Objetivo**: migrar todos os segredos do MedSeguro (`.env`, chaves hardcoded) para um cofre central, com autenticação de aplicação e credenciais dinâmicas.

#### Como a indústria faz hoje
Segredo em código é a vulnerabilidade que o Eixo 2 mostrou ser trivial de encontrar (GitHub dorking). O padrão de mercado é cofre central: **HashiCorp Vault**, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault. Aplicações se autenticam por identidade de máquina (AppRole, IAM, Kubernetes SA) e leem segredos em runtime — nada persiste em disco em claro.

#### Ameaça abordada
**T6 — Segredo em código-fonte**. Além disso, credenciais dinâmicas de TTL curto reduzem o valor de qualquer segredo eventualmente vazado.

#### Conceito (teoria curta)
- A hierarquia: hardcoded → `.env` → variável de ambiente → cofre → cofre + credencial dinâmica.
- Vault: mecanismos de segredo (KV, DB, PKI), métodos de auth (AppRole), políticas, audit log.
- Credenciais dinâmicas: banco gera usuário efêmero por requisição, com TTL.
- Unsealing e Shamir Secret Sharing.

#### Prática guiada

> **⚠️ Vault em modo dev perde tudo ao reiniciar.** O modo dev mantém o estado só em memória. Entre o Encontro 10 e o 11 (dias depois), todo o setup (KV, roles, transit) desaparece se o contêiner reiniciar. **Solução da oficina**: todo o bloco `bash` abaixo é salvo como `bootstrap-vault.sh` **idempotente** e re-executado no início de cada encontro que use o Vault. Alternativa mais fiel à produção: rodar o Vault com *integrated storage* (raft) e volume Docker persistente — deixamos isso como extensão, pois o modo dev + script de bootstrap é suficiente para a oficina e mais simples de depurar.

```bash
#!/usr/bin/env bash
# bootstrap-vault.sh — idempotente: re-executável no início de cada encontro
set -euo pipefail

# subir o Vault em modo dev (só laboratório!)
# (rodar em contêiner à parte; aqui assumimos que já está de pé)
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=dev-root

# helper: só habilita o motor se ainda não estiver habilitado (idempotência)
enable_if_absent() { vault secrets list -format=json | grep -q "\"$1/\"" || vault secrets enable "${@:2}"; }

# 1) MECANISMO KV — segredos estáticos
enable_if_absent kv -version=2 kv
vault kv put kv/medseguro/app \
  SESSION_SECRET="$(openssl rand -hex 32)" \
  JWT_KEY="$(openssl rand -hex 32)"

# 2) MÉTODO APPROLE — identidade de máquina para a aplicação
vault auth list -format=json | grep -q '"approle/"' || vault auth enable approle
vault policy write medseguro-app - << 'EOF'
path "kv/data/medseguro/*"                 { capabilities = ["read"] }
path "database/creds/medseguro-role"       { capabilities = ["read"] }
# transit: a app cifra/decifra DEKs pela KEK (Encontro 11) — mesma identidade AppRole
path "transit/encrypt/medseguro-kek"       { capabilities = ["update"] }
path "transit/decrypt/medseguro-kek"       { capabilities = ["update"] }
EOF
vault write auth/approle/role/medseguro \
  token_policies="medseguro-app" token_ttl=1h token_max_ttl=4h

# 3) MECANISMO DATABASE — credenciais DINÂMICAS (TTL curto)
enable_if_absent database database
vault write database/config/medseguro-db \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/medseguro" \
  allowed_roles="medseguro-role" username="vault-admin" password="${DB_ADMIN_PASS}"

# ⚠️ A aplicação LÊ E ESCREVE (cadastro, prontuários). Um role só-SELECT quebraria
# toda escrita. Concedemos o CRUD mínimo que a aplicação precisa — e usamos
# ALTER DEFAULT PRIVILEGES para que TABELAS CRIADAS DEPOIS também sejam cobertas
# (GRANT ... ON ALL TABLES só afeta as existentes no momento do grant).
vault write database/roles/medseguro-role \
  db_name=medseguro-db default_ttl=1h max_ttl=24h \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO \"{{name}}\";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO \"{{name}}\";"
```

> **Discussão de menor privilégio (não é bug — é lição).** "Privilégio mínimo" aqui **não** é "só SELECT"; é "o mínimo que a aplicação de fato precisa". A aplicação escreve, logo precisa de INSERT/UPDATE/DELETE. O rigor está em **não** conceder o que ela não usa: sem DROP, sem ALTER de esquema, sem acesso a outras bases. Se houvesse um serviço só-leitura (ex.: relatórios), este teria um role separado só com SELECT.

```javascript
// vault-client.mjs — app lê segredos do Vault em runtime
import vault from 'node-vault';

const client = vault({ endpoint: process.env.VAULT_ADDR });

// aplicação autentica com AppRole (role_id + secret_id injetados pelo orquestrador)
async function autenticar() {
  const r = await client.approleLogin({
    role_id: process.env.VAULT_ROLE_ID,
    secret_id: process.env.VAULT_SECRET_ID,
  });
  client.token = r.auth.client_token;
}

// ler segredos estáticos
async function carregarSegredos() {
  const { data } = await client.read('kv/data/medseguro/app');
  return data.data;   // { SESSION_SECRET, JWT_KEY }
}

// obter credencial de banco DINÂMICA (usuário efêmero, some em 1h)
async function credencialBanco() {
  const { data } = await client.read('database/creds/medseguro-role');
  return { usuario: data.username, senha: data.password };
}

await autenticar();
const segredos = await carregarSegredos();
const db = await credencialBanco();
console.log('App autenticada. Nenhum segredo em disco ou código.');
```

#### Justificativa arquitetural
O salto conceitual está nas **credenciais dinâmicas**. Com KV, o segredo ainda é estático — melhor que hardcoded, mas se vazar, vale até ser rotacionado. Com o mecanismo de banco, o Vault *cria um usuário PostgreSQL novo a cada requisição*, com TTL de 1 hora. Se o processo for comprometido e a credencial capturada, ela expira em minutos e nunca foi compartilhada com outro processo. Reduz-se de "rotacionar manualmente e torcer" para "a exposição se autolimita por design".

**Unsealing**: o Vault, ao iniciar, está *lacrado* — sua própria chave mestra é dividida por Shamir Secret Sharing em N partes, exigindo M delas para destravar. Nenhuma pessoa sozinha destrava o cofre. É controle organizacional embutido no mecanismo — o mesmo princípio de "duas chaves para o cofre do banco".

> **Aplicando o modelo de ameaça ao próprio controle (o cofre não é mágico).** Coerência exige submeter o Vault ao mesmo escrutínio que aplicamos ao resto. Centralizar segredos **reduz** a superfície (há um lugar para proteger, auditar e rotacionar) mas **cria um alvo de altíssimo valor e um ponto único**:
> - **Disponibilidade**: se o Vault cai, a aplicação perde acesso a segredos e a credenciais dinâmicas — a operação para. Mitigação: Vault em **HA** (múltiplos nós, integrated storage/raft), não o nó único do laboratório.
> - **Confidencialidade**: se o Vault é comprometido *e destravado*, tudo cai junto. Mitigações: manter o Vault selado quando possível, `audit log` íntegro e monitorado, políticas de menor privilégio por AppRole, e o unsealing M-de-N para que nenhum operador sozinho abra o cofre.
> - **O paradoxo**: concentrar não elimina risco, o *transforma* — de "muitos segredos espalhados e difíceis de rotacionar" para "um cofre crítico bem defendido". A troca vale a pena, mas só se o cofre for tratado como o ativo mais crítico da arquitetura. Discuta isto explicitamente com a turma no Encontro 12.

#### Verificação
- [ ] Vault operacional; segredos do MedSeguro migrados para KV.
- [ ] App autentica por AppRole e lê segredos em runtime.
- [ ] Credencial dinâmica de banco gerada com TTL; usuário expira; role concede CRUD (não só SELECT).
- [ ] Nenhum segredo permanece em `.env` ou código (verificado por busca).
- [ ] Aluno explica a vantagem de credencial dinâmica sobre segredo estático.
- [ ] Aluno articula o Vault como ponto único/alvo de alto valor e cita mitigações (HA, audit, selado).

---

### 🔧 ENCONTRO 11 — Envelope Encryption, KMS e Rotação de Chave

**Objetivo**: proteger dados em repouso com o padrão de duas camadas (DEK/KEK) e demonstrar rotação de chave sem reencriptar todos os dados.

#### Como a indústria faz hoje
Cifragem em repouso em escala usa **envelope encryption**: cada dado é cifrado com uma chave de dados (DEK); a DEK é cifrada por uma chave mestra (KEK) guardada em KMS/HSM. É como AWS KMS, GCP KMS e o motor `transit` do Vault operam. Permite rotacionar a KEK sem tocar em petabytes de dados — só as DEKs são reencriptadas.

#### Ameaça abordada
**T3 — Roubo de disco/backup** e **T8 — Chave comprometida**. A camada dupla permite responder a comprometimento de chave sem parar a operação.

#### Conceito (teoria curta)
- DEK (data encryption key) × KEK (key encryption key).
- Por que a separação permite rotação barata.
- Motor `transit` do Vault: "cripto como serviço" — a chave nunca sai do cofre.
- Rotação: versionar a KEK; reencriptar DEKs; dado permanece.

#### Prática guiada

```bash
# habilitar o motor transit (cripto como serviço)
vault secrets enable transit
vault write -f transit/keys/medseguro-kek   # cria a KEK (nunca sai do Vault)
```

```javascript
// envelope.mjs — envelope encryption com Vault transit
import vault from 'node-vault';
import sodium from 'libsodium-wrappers';
await sodium.ready;

// Autenticação por AppRole — MESMO padrão do Encontro 10 (vault-client.mjs),
// não um token fixo de ambiente. Coerência: a aplicação sempre se autentica
// como máquina, com token de vida curta obtido do próprio Vault.
const client = vault({ endpoint: process.env.VAULT_ADDR });
async function autenticar() {
  const r = await client.approleLogin({
    role_id: process.env.VAULT_ROLE_ID,
    secret_id: process.env.VAULT_SECRET_ID,
  });
  client.token = r.auth.client_token;
}
await autenticar();

// CIFRAR um prontuário com envelope encryption
async function cifrarProntuario(textoClaro) {
  // 1) gerar DEK local aleatória
  const dek = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();

  // 2) cifrar o dado com a DEK (rápido, local)
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const cifrado = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    sodium.from_string(textoClaro), null, null, nonce, dek);

  // 3) cifrar a DEK com a KEK do Vault (a KEK nunca sai do cofre)
  const { data } = await client.write('transit/encrypt/medseguro-kek', {
    plaintext: Buffer.from(dek).toString('base64'),
  });

  // 4) persistir: dado cifrado + nonce + DEK-cifrada (nunca a DEK em claro)
  return {
    dado: sodium.to_base64(cifrado),
    nonce: sodium.to_base64(nonce),
    dekCifrada: data.ciphertext,   // "vault:v1:...."
  };
}

async function decifrarProntuario({ dado, nonce, dekCifrada }) {
  // 1) pedir ao Vault para decifrar a DEK (autorização controlada, auditada)
  const { data } = await client.write('transit/decrypt/medseguro-kek',
    { ciphertext: dekCifrada });
  const dek = Buffer.from(data.plaintext, 'base64');

  // 2) decifrar o dado com a DEK recuperada
  const claro = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, sodium.from_base64(dado), null, sodium.from_base64(nonce), dek);
  return sodium.to_string(claro);
}

const reg = await cifrarProntuario('Histórico: hipertensão, em tratamento.');
console.log('No banco:', reg);   // note: "vault:v1:" — versão da KEK
console.log('Lido:', await decifrarProntuario(reg));
```

```bash
# ROTAÇÃO DE CHAVE — o ponto alto
vault write -f transit/keys/medseguro-kek/rotate   # agora existe v2

# rewrap: reescreve a DEK-cifrada para a nova versão da KEK,
# SEM decifrar o dado, SEM tocar o prontuário
vault write transit/rewrap/medseguro-kek ciphertext="vault:v1:...."
# retorna "vault:v2:...." — só a DEK-cifrada muda; o dado permanece intacto
```

#### Justificativa arquitetural
O gênio do envelope encryption é o desacoplamento. O dado (potencialmente petabytes) é cifrado por DEKs. As DEKs (pequenas) são cifradas pela KEK. Rotacionar a KEK — exigência regulatória e boa prática após suspeita de comprometimento — significa reencriptar apenas as DEKs, operação de `rewrap` que nem decifra o dado. Sem envelope, rotacionar a chave exigiria decifrar e recifrar todo o acervo: inviável em escala.

O motor `transit` acrescenta outra propriedade: a KEK **nunca sai do Vault**. A aplicação envia a DEK para o Vault cifrar/decifrar; a chave mestra permanece no cofre, com cada operação autorizada e auditada. É "criptografia como serviço" — o modelo de AWS KMS e GCP KMS. A aplicação nunca segura a chave mais valiosa.

**Fechamento do arco**: a chave de campo do Encontro 3, que geramos localmente "por ora", agora tem seu lugar correto — é uma DEK, protegida por uma KEK no cofre. O sistema fecha o ciclo.

#### Verificação
- [ ] Prontuário cifrado por envelope encryption; DEK nunca persiste em claro.
- [ ] KEK permanece no Vault; decifragem passa pelo cofre (auditada).
- [ ] Rotação da KEK executada; `rewrap` atualiza DEK sem tocar o dado.
- [ ] Aluno explica por que envelope permite rotação barata em escala.

---

### 🔧 ENCONTRO 12 — Integração Final, Auditoria e Apresentação

**Objetivo**: integrar todas as camadas em um sistema coeso, auditar a postura criptográfica e apresentar a arquitetura justificando cada decisão.

#### Como a indústria faz hoje
Sistemas passam por revisão de arquitetura de segurança e auditoria periódica. Ferramentas de varredura (testssl, scanners de configuração), revisão de código e *threat modeling* (STRIDE/LINDDUN) validam a postura. A entrega final espelha uma revisão de arquitetura real.

#### Atividade integradora

**1. Montagem do sistema completo** — todas as camadas operando juntas:

```
Paciente/Médico (HTTPS+HSTS)
   ↓
Caddy (TLS 1.3, terminação) [Camada 1]
   ↓ HTTP interno
API MedSeguro (Node) [Camada 2]
   ├─ login: Argon2id + sessão segura + MFA (TOTP/WebAuthn)
   ├─ JWT de acesso (jose, alg explícito, exp curto)
   ↓ mTLS [Camada 3]
Microserviços (prontuário ↔ prescrição)
   ↓
PostgreSQL [Camada 4]
   └─ prontuário cifrado por envelope (DEK/KEK)
Vault [Camada 5]
   ├─ KV (segredos estáticos)
   ├─ database (credenciais dinâmicas)
   ├─ PKI (certificados internos)
   └─ transit (KEK, envelope, rotação)
```

**2. Auditoria da postura criptográfica** — checklist de revisão:

```markdown
## Auditoria MedSeguro — Postura Criptográfica

### Em trânsito
- [ ] TLS 1.3 na borda, nota A no testssl
- [ ] HSTS ativo
- [ ] mTLS entre serviços internos
- [ ] Nenhum tráfego de dado pessoal em HTTP claro

### Senhas e autenticação
- [ ] Argon2id calibrado para o hardware (não apenas o piso de 19 MiB)
- [ ] Nenhuma senha armazenada de forma reversível
- [ ] Rate limiting no login (defesa online) além do hash (defesa offline)
- [ ] MFA obrigatório para acesso médico (WebAuthn com userVerification required)
- [ ] TOTP recusa replay dentro da janela
- [ ] JWT com alg explícito, exp curto, aud/iss validados
- [ ] Sessão em store externo (Redis), não MemoryStore
- [ ] Cookies HttpOnly + Secure + SameSite

### Em repouso
- [ ] Dado sensível cifrado em nível de campo (envelope)
- [ ] Nenhuma chave de campo persistida ao lado do dado (corrigido do Encontro 3)
- [ ] DEK nunca em claro no banco
- [ ] KEK no Vault, nunca na aplicação
- [ ] Rotação de KEK demonstrada

### Segredos
- [ ] Zero segredos em código/`.env` (verificado por scan)
- [ ] Nenhum segredo em camadas/histórico da imagem Docker (ARG/COPY de .env)
- [ ] AppRole para identidade de aplicação
- [ ] Credenciais de banco dinâmicas com TTL e privilégio mínimo real (CRUD, não tudo)
- [ ] Audit log do Vault ativo
- [ ] Vault reconhecido como ponto único: mitigação (HA/selado) documentada

### Modelo de ameaça
- [ ] Cada uma das 8 ameaças (T1-T8) mapeada a um controle
- [ ] Para cada controle: "protege contra quem, não protege contra quem"
- [ ] Controles online vs. offline distinguidos (ex.: rate limit vs. hash forte)
```

**3. Apresentação final** (por grupo, 20 min + arguição):

Cada grupo apresenta a arquitetura do MedSeguro **justificando cada camada pelo modelo de ameaça**. A arguição do docente cobra: "por que esta escolha e não a alternativa?", "contra qual ameaça isto protege?", "qual o modo de falha deste controle?".

#### Entregável final da oficina
1. Repositório Git com o sistema completo, versionado por encontro (tags ou branches).
2. Documento de arquitetura (8-15 páginas) com o diagrama de camadas e a justificativa de cada decisão criptográfica ligada ao modelo de ameaça.
3. Checklist de auditoria preenchido e evidenciado.
4. Apresentação (slides) + defesa oral.

#### Verificação final
- [ ] Sistema completo opera ponta a ponta.
- [ ] Todas as 8 ameaças mapeadas a controles.
- [ ] Cada aluno consegue justificar qualquer camada sob arguição.
- [ ] Documento de arquitetura coerente e defensável.

---

## PARTE D — AVALIAÇÃO DA OFICINA

### D.1 Distribuição de pontuação

| Componente | Peso |
|---|---|
| Entregáveis semanais (verificação de cada encontro) | 40% |
| Sistema integrado funcional (Encontro 12) | 25% |
| Documento de arquitetura com justificativa por ameaça | 20% |
| Apresentação e defesa oral (arguição) | 15% |

### D.2 Critérios de excelência

| Critério | Excelente | Aceitável | Deficiente |
|---|---|---|---|
| **Uso correto de bibliotecas** | Nunca reimplementa primitivo; usa APIs de alto nível; trata nonce/salt/erro corretamente | Uso adequado com 1-2 lacunas | Combina primitivos à mão; nonce reusado |
| **Justificativa por ameaça** | Cada controle amarrado a ameaça específica; sabe o que NÃO protege | Justifica a maioria; algumas lacunas | "É mais seguro" sem modelo de ameaça |
| **Visão arquitetural** | Enxerga as camadas integradas; entende trade-offs entre elas | Vê as camadas isoladas | Trata cada exercício como avulso |
| **Aderência ao mercado** | Reconhece como a indústria faz e por quê | Cita práticas sem articular | Desconhece a prática real |
| **Defesa sob arguição** | Sustenta e admite limites | Sustenta com hesitação | Não sustenta |

### D.3 Princípios de conduta da oficina (afixados no laboratório)

- ✅ Todo o trabalho ocorre sobre o sistema fictício MedSeguro e dados fictícios.
- ✅ Chaves, certificados e segredos gerados são de laboratório — nunca instalados no SO principal nem publicados.
- ✅ As técnicas são para construção defensiva; sua aplicação a sistemas de terceiros exige autorização formal.
- ❌ Nenhum primitivo criptográfico é reimplementado para uso "real" — apenas demonstrado para entendimento.
- ❌ Nenhum dado pessoal real entra no laboratório.

---

## PARTE E — RECURSOS E PRÉ-REQUISITOS DE INFRAESTRUTURA

### E.1 Por estação de aluno
- Node.js LTS (v20+), npm.
- Docker + Docker Compose.
- `openssl` (v3+).
- Editor (VS Code recomendado).
- Navegador moderno (para WebAuthn — exige HTTPS/localhost e autenticador de plataforma ou chave física).
- 8 GB RAM recomendável (Vault + PostgreSQL + app em contêiner).

### E.2 Bibliotecas Node utilizadas
| Biblioteca | Uso |
|---|---|
| `libsodium-wrappers` / `sodium-native` | AEAD, crypto_box, secretbox |
| `argon2` | Hash de senha |
| `jose` | JWT/JWS/JWE |
| `express` + `express-session` + `connect-redis` + `redis` | Aplicação e sessão em store externo |
| `express-rate-limit` | Rate limiting do login |
| `otplib` + `qrcode` | TOTP (⚠️ API muda entre 12.x/13.x — ver nota no Encontro 1) |
| `@simplewebauthn/server` + `@simplewebauthn/browser` | WebAuthn/Passkeys (servidor + navegador) |
| `node-vault` | Cliente HashiCorp Vault |
| `pg` | PostgreSQL |
| `vitest` (dev) | Testes de propriedades de segurança (ver E.5) |

### E.3 Serviços em contêiner
| Serviço | Imagem |
|---|---|
| Proxy TLS | `caddy:2-alpine` |
| Store de sessão | `redis:7-alpine` |
| Banco de dados | `postgres:16-alpine` |
| Cofre de segredos | `hashicorp/vault` |
| Auditoria TLS | `drwetter/testssl.sh` |

### E.4 Alternativa de baixo recurso
Para máquinas com 4 GB RAM: rodar Vault em modo dev (sem HA), Redis, PostgreSQL e app compartilhando um único compose, e adiar contêineres pesados. As camadas 0-4 rodam sem Docker (Node puro + openssl); Docker torna-se necessário a partir do Encontro 5. Redis pode ser adiado até o Encontro 7 se a memória apertar.

### E.5 Testes de propriedades de segurança (usando o `vitest` do Encontro 1)
O `vitest` instalado no Encontro 1 reaparece aqui como ferramenta de verificação — como a indústria faz, transformando requisitos de segurança em testes automatizados. Exemplos de propriedades a testar ao longo da oficina:
- Senha nunca persiste em claro (o valor salvo começa com `$argon2id$`).
- Endpoint protegido rejeita requisição sem JWT válido.
- Serviço de prontuário rejeita conexão sem certificado de cliente (mTLS).
- Nenhum segredo aparece em `git grep` por padrões conhecidos (`BEGIN PRIVATE KEY`, `SESSION_SECRET=`).

### E.6 Contingência por sistema operacional (turma heterogênea)
A oficina assume ambientes diferentes entre alunos; pontos de atenção:
- **WebAuthn**: exige `localhost` ou HTTPS confiável. No Windows, o Windows Hello serve de autenticador de plataforma; em máquinas sem biometria, usar chave física (FIDO2) ou o autenticador virtual do DevTools do navegador (Chrome: *WebAuthn tab*).
- **Docker no macOS/Windows**: volumes têm performance inferior à do Linux; para o Postgres/Vault isso é irrelevante, mas evite bind-mounts grandes. O DNS interno de contêiner (`app`, `vault`, `postgres`) funciona igual nos três SOs via rede do Compose.
- **`openssl`**: no macOS, o `openssl` do sistema pode ser LibreSSL, com flags ligeiramente distintas; instalar o OpenSSL 3 via Homebrew (`brew install openssl@3`) evita surpresas nos comandos do Encontro 6.
- **Fim de linha / permissões**: chaves geradas no Windows podem herdar permissões amplas; em WSL2/Linux, garantir `chmod 600` nas chaves privadas (o mTLS e o SSH recusam chaves com permissão frouxa).

### E.7 Segredos e imagens Docker (armadilha de supply chain)
A oficina ensina a tirar segredos do código — mas segredos também vazam para **camadas da imagem Docker**. Regras: nunca `COPY .env` para dentro da imagem; nunca passar segredo por `ARG` (fica no histórico da imagem, recuperável com `docker history`); usar `.dockerignore` para excluir `.env`, chaves e certificados de dev; injetar segredos em runtime (variável de ambiente do orquestrador ou, melhor, AppRole do Vault). Este é o mesmo vetor T6, um passo adiante.

---

## PARTE F — REFERÊNCIAS

### Padrões e guias
- OWASP Cryptographic Storage Cheat Sheet.
- OWASP Password Storage Cheat Sheet.
- OWASP Secrets Management Cheat Sheet.
- OWASP Authentication Cheat Sheet.
- NIST SP 800-63B — Digital Identity Guidelines.
- NIST SP 800-57 — Key Management.
- RFC 8446 (TLS 1.3), RFC 5280 (X.509), RFC 6238 (TOTP), RFC 7519 (JWT).
- W3C WebAuthn Level 3.

### Documentação de ferramentas
- libsodium: https://doc.libsodium.org
- jose (Node): https://github.com/panva/jose
- HashiCorp Vault: https://developer.hashicorp.com/vault
- SimpleWebAuthn: https://simplewebauthn.dev
- Caddy: https://caddyserver.com/docs
- step-ca: https://smallstep.com/docs/step-ca

### Leitura de fundo
- AUMASSON, J.-P. *Serious Cryptography*. No Starch Press.
- Matthew Green — *A Few Thoughts on Cryptographic Engineering* (blog).

---

**Oficina concebida e conduzida por Prof. Luís Vitorino do Nascimento Júnior**
*Segurança da Informação — TADS / IFPI*
