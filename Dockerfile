# =============================================================================
# Site institucional da YBS Prestação de Serviços Administrativos
# Imagem única: nginx servindo arquivos estáticos.
# Método de construção no EasyPanel: Dockerfile. Porta do container: 80.
# =============================================================================
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Site YBS Serviços Administrativos" \
      org.opencontainers.image.description="Site institucional estático da YBS Prestação de Serviços Administrativos LTDA" \
      org.opencontainers.image.vendor="YBS Prestação de Serviços Administrativos LTDA"

ENV TZ=America/Sao_Paulo

# Configuração do servidor (cache, compressão, cabeçalhos de segurança, healthcheck)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Conteúdo do site
COPY site/ /usr/share/nginx/html/

# Remove o index padrão do nginx, caso ele sobre na imagem base
RUN rm -f /usr/share/nginx/html/50x.html \
 && nginx -t

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=4s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
