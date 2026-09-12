# Site YBS Serviços Administrativos

Site institucional estático da **YBS Prestação de Serviços Administrativos LTDA**
(CNPJ 59.156.649/0001-49), pronto para deploy no EasyPanel pelo método **Dockerfile**.

Sem banco de dados, sem backend, sem build step. O container sobe com nginx servindo
os arquivos da pasta `site/`.

---

## Estrutura

```
ybs-servicos/
├── Dockerfile            # imagem nginx, porta 80
├── nginx.conf            # cache, gzip, cabeçalhos de segurança, healthcheck
├── docker-compose.yml    # apenas para testar na sua máquina
├── .dockerignore
└── site/                 # tudo que vai para o ar
    ├── index.html        # página principal
    ├── privacidade.html  # política de privacidade (LGPD)
    ├── 404.html
    ├── styles.css
    ├── script.js         # menu, animações, formulário
    ├── config.js         # >>> contatos do site, único arquivo a editar <<<
    ├── favicon.svg
    ├── apple-touch-icon.png
    ├── og-image.png      # imagem de compartilhamento no WhatsApp e redes
    ├── manifest.webmanifest
    ├── robots.txt
    └── sitemap.xml
```

---

## 1. Antes de publicar, preencher

### a) Contatos, em `site/config.js`

```js
window.YBS_CONFIG = {
  whatsapp: "",                          // ex.: "5511998877665" (só dígitos, com o 55)
  email: "robsonjorgeadvs@gmail.com",
  telefone: "(11) 1145-4500",
  telefoneLink: "+551111454500",
  saudacaoWhatsapp: "..."
};
```

Com `whatsapp` vazio, todos os botões do site funcionam por e-mail e o formulário
abre o aplicativo de e-mail do visitante. Ao preencher o número, os botões passam a
abrir o WhatsApp com a mensagem pronta, o WhatsApp entra na lista de contatos e o
botão do formulário vira "Enviar pelo WhatsApp". Nada mais precisa ser mexido.

O e-mail e o telefone que estão no arquivo vieram do cadastro público da Receita
Federal. Vale confirmar os dois e trocar por um e-mail do domínio próprio quando
existir, por exemplo `contato@ybsservicos.com.br`.

### b) Domínio

O código usa `https://www.ybsservicos.com.br` como endereço no `canonical`, nas tags
de compartilhamento, no `robots.txt` e no `sitemap.xml`. Para trocar pelo domínio
verdadeiro, rode na pasta do projeto:

```bash
./trocar-dominio.sh www.odominioreal.com.br
```

### c) Horário de atendimento

O site informa "de segunda a sexta, das 9h às 18h", na seção de contato e no
`index.html` (bloco JSON-LD). Ajuste se for diferente.

---

## 2. Testar na sua máquina

Com Docker:

```bash
docker compose up --build
# abre em http://localhost:8080
```

Sem Docker, apenas para ver o visual:

```bash
cd site && python3 -m http.server 8899
# abre em http://localhost:8899
```

---

## 3. Deploy no EasyPanel

1. Suba esta pasta para um repositório no GitHub (pode ser privado).
2. No EasyPanel, entre no projeto e clique em **+ Service → App**. Dê o nome
   `ybs-site`.
3. Aba **Source**: escolha **GitHub**, selecione o repositório e a branch `main`.
   Deixe o **Build Path** como `/`.
4. Aba **Build**: em **Build Method**, selecione **Dockerfile**. Em **Dockerfile
   Path**, deixe `Dockerfile`. Não é preciso nenhuma variável de ambiente.
5. Clique em **Deploy** e acompanhe o log até aparecer o container em execução.
6. Aba **Domains**: clique em **Add Domain**, informe o domínio, marque **HTTPS**
   (certificado Let's Encrypt) e use **Port 80**, que é a porta em que o nginx
   escuta dentro do container.
7. No seu provedor de DNS, aponte o domínio para o IP da VPS:
   - registro `A` para `@` apontando para o IP do servidor
   - registro `A` ou `CNAME` para `www`
8. Teste `https://seudominio.com.br/healthz`. A resposta deve ser `ok`.

Para publicar uma alteração depois: faça o commit e o push no GitHub e clique em
**Deploy** de novo no EasyPanel.

---

## 4. Detalhes técnicos

- **Imagem**: `nginx:1.27-alpine`, porta 80, healthcheck interno em `/healthz`.
- **Cache**: HTML sempre revalidado, CSS e JS por 7 dias, imagens e fontes por 30
  dias. Os arquivos são chamados como `styles.css?v=1`. Ao editar o CSS ou o JS,
  suba esse número nas três páginas para o navegador do visitante pegar a versão
  nova na hora.
- **Compressão**: gzip ligado para HTML, CSS, JS, SVG, JSON e XML.
- **Segurança**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` e uma `Content-Security-Policy` restritiva. Se um dia
  entrar Google Analytics, Meta Pixel ou qualquer script externo, o domínio dele
  precisa ser liberado na CSP dentro do `nginx.conf`, senão o navegador bloqueia.
- **Fontes**: Inter e Newsreader, carregadas do Google Fonts.
- **Acessibilidade**: navegação por teclado, foco visível, textos alternativos,
  contraste conferido e respeito a `prefers-reduced-motion`.

---

## 5. Conteúdo

Todo o texto está direto no `site/index.html`, em português, sem CMS. Para editar
uma seção, procure pelo trecho e altere. As seções são, na ordem: topo, faixa de
resumo, serviços, como funciona, para quem, a empresa, dúvidas frequentes,
contato e rodapé.

A página não exibe dados do cadastro do CNPJ (razão social completa com número,
situação cadastral, CNAEs, data de abertura). Isso foi retirado de propósito. O
número do CNPJ aparece apenas na política de privacidade, na identificação do
controlador dos dados, porque a LGPD pede que o responsável esteja identificado.

**Atenção ao posicionamento:** o site diz, na seção de dúvidas e no rodapé, que a YBS
não exerce atividades privativas de advocacia nem de contabilidade. Isso protege a
empresa e deve continuar assim enquanto o CNPJ tiver os CNAEs atuais (70.20-4/00,
82.11-3/00 e 82.19-9/99).
