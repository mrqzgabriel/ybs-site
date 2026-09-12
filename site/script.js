/* ==========================================================================
   YBS, comportamentos do site: menu, animações, contatos e formulário.
   Sem dependências externas.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.YBS_CONFIG || {};
  var zap = String(cfg.whatsapp || '').replace(/\D/g, '');
  var temZap = zap.length >= 12;
  var email = cfg.email || 'robsonjorgeadvs@gmail.com';

  function $(sel, escopo) { return (escopo || document).querySelector(sel); }
  function $$(sel, escopo) { return Array.prototype.slice.call((escopo || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------- ano atual */
  $$('[data-ano]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ------------------------------------------------- contatos configurados */
  $$('[data-email-link]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + email);
    if (el.textContent.indexOf('@') > -1) { el.textContent = email; }
  });

  if (cfg.telefone && cfg.telefoneLink) {
    $$('[data-tel-link]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + cfg.telefoneLink);
      el.textContent = cfg.telefone;
    });
  }

  function urlZap(texto) {
    return 'https://wa.me/' + zap + '?text=' + encodeURIComponent(texto);
  }

  if (temZap) {
    var saudacao = cfg.saudacaoWhatsapp || 'Olá! Vim pelo site da YBS.';

    /* O botão do topo e o botão fixo passam a abrir o WhatsApp. */
    $$('[data-contato-cta], [data-float-cta]').forEach(function (el) {
      el.setAttribute('href', urlZap(saudacao));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    /* WhatsApp entra na lista de contatos, acima do e-mail. */
    var lista = $('.contact-list');
    if (lista) {
      var li = document.createElement('li');
      li.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-chat"></use></svg>' +
        '<span><strong>WhatsApp</strong><a target="_blank" rel="noopener" href="' + urlZap(saudacao) + '">' +
        formataZap(zap) + '</a></span>';
      lista.insertBefore(li, lista.firstElementChild);
    }

    var rotulo = $('[data-submit-label]');
    if (rotulo) { rotulo.textContent = 'Enviar pelo WhatsApp'; }
    var ajuda = $('[data-form-help]');
    if (ajuda) { ajuda.textContent = 'Sua mensagem abre pronta no WhatsApp, com os dados preenchidos.'; }
  }

  function formataZap(n) {
    var m = n.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : '+' + n;
  }

  /* ----------------------------------------------------- cabeçalho e menu */
  var header = $('.site-header');
  var nav = $('#nav-principal');
  var toggle = $('.nav-toggle');
  var floatCta = $('[data-float-cta]');

  function fechaMenu() {
    if (!nav || !toggle) { return; }
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var aberto = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', fechaMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { fechaMenu(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) { fechaMenu(); }
    });
  }

  var ultimoScroll = -1;
  function aoRolar() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (y === ultimoScroll) { return; }
    ultimoScroll = y;
    if (header) { header.classList.toggle('is-scrolled', y > 12); }
    if (floatCta) { floatCta.classList.toggle('is-visible', y > 620); }
  }
  window.addEventListener('scroll', function () { window.requestAnimationFrame(aoRolar); }, { passive: true });
  aoRolar();

  /* ------------------------------------------------- animação de entrada */
  var alvos = $$('.reveal');
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revelaTudo() {
    alvos.forEach(function (el) { el.classList.add('is-in'); });
  }

  function revelaVisiveis() {
    var altura = window.innerHeight || 0;
    alvos.forEach(function (el) {
      if (el.classList.contains('is-in')) { return; }
      var r = el.getBoundingClientRect();
      if (r.top < altura && r.bottom > 0) { el.classList.add('is-in'); }
    });
  }

  /* Aba em segundo plano congela o IntersectionObserver e o rolar suave do
     navegador. Nesse caso, e sem IntersectionObserver ou com movimento
     reduzido, o conteúdo aparece de uma vez, sem animação. */
  if (semMovimento || !('IntersectionObserver' in window) || document.visibilityState === 'hidden') {
    revelaTudo();
  } else {
    revelaVisiveis();

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        var el = entrada.target;
        var irmaos = el.parentElement ? $$('.reveal', el.parentElement) : [el];
        var atraso = Math.min(irmaos.indexOf(el), 5) * 70;
        setTimeout(function () { el.classList.add('is-in'); }, atraso);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { obs.observe(el); });

    window.addEventListener('load', revelaVisiveis);
    window.addEventListener('hashchange', function () { setTimeout(revelaVisiveis, 500); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { revelaTudo(); }
    });
  }

  /* Link aberto direto numa seção: com a aba em segundo plano o navegador não
     executa o rolar suave, então a posição é ajustada na mão. */
  if (location.hash && location.hash.length > 1) {
    window.addEventListener('load', function () {
      var destino = null;
      try { destino = document.querySelector(location.hash); } catch (e) { destino = null; }
      if (destino && window.pageYOffset < 10) {
        destino.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
  }

  /* ------------------------------------------- seção ativa na navegação */
  var secoes = $$('main section[id]');
  var links = {};
  $$('.nav > a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });

  if (secoes.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var link = links[entrada.target.id];
        if (!link) { return; }
        if (entrada.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------ formulário */
  var form = $('#form-contato');
  if (!form) { return; }

  var status = $('[data-form-status]', form);

  function avisa(texto, tipo) {
    if (!status) { return; }
    status.textContent = texto;
    status.className = 'form-status' + (tipo ? ' is-' + tipo : '');
  }

  function valido(campo) {
    var v = (campo.value || '').trim();
    if (campo.type === 'checkbox') { return campo.checked; }
    if (!v) { return !campo.required; }
    if (campo.type === 'email') { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
    if (campo.type === 'tel') { return v.replace(/\D/g, '').length >= 10; }
    return true;
  }

  $$('input, textarea', form).forEach(function (campo) {
    campo.addEventListener('input', function () { campo.removeAttribute('aria-invalid'); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var obrigatorios = $$('[required]', form);
    var primeiroErro = null;

    obrigatorios.forEach(function (campo) {
      if (valido(campo)) {
        campo.removeAttribute('aria-invalid');
      } else {
        campo.setAttribute('aria-invalid', 'true');
        if (!primeiroErro) { primeiroErro = campo; }
      }
    });

    if (primeiroErro) {
      if (primeiroErro.id === 'aceite') {
        avisa('Marque a autorização para que possamos responder.', 'error');
      } else {
        avisa('Confira os campos destacados e tente de novo.', 'error');
      }
      primeiroErro.focus();
      return;
    }

    var d = {
      nome: $('#nome', form).value.trim(),
      empresa: $('#empresa', form).value.trim(),
      email: $('#email', form).value.trim(),
      telefone: $('#telefone', form).value.trim(),
      assunto: $('#assunto', form).value,
      mensagem: $('#mensagem', form).value.trim()
    };

    var linhas = [
      'Contato pelo site da YBS',
      '',
      'Nome: ' + d.nome,
      'Empresa: ' + (d.empresa || 'não informada'),
      'E-mail: ' + d.email,
      'Telefone: ' + d.telefone,
      'Assunto: ' + d.assunto
    ];
    if (d.mensagem) { linhas.push('', 'Mensagem:', d.mensagem); }
    var corpo = linhas.join('\n');

    if (temZap) {
      window.open(urlZap(corpo), '_blank', 'noopener');
      avisa('Abrimos o WhatsApp com sua mensagem pronta. Basta enviar.', 'ok');
    } else {
      var assunto = 'Site YBS, ' + d.assunto + ', ' + d.nome;
      window.location.href = 'mailto:' + email +
        '?subject=' + encodeURIComponent(assunto) +
        '&body=' + encodeURIComponent(corpo);
      avisa('Abrimos seu aplicativo de e-mail com a mensagem pronta. Basta enviar.', 'ok');
    }

    form.reset();
  });
})();
