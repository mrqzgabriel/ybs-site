#!/usr/bin/env bash
# Troca o domínio de exemplo pelo domínio real em todos os arquivos do site.
# Uso: ./trocar-dominio.sh www.odominioreal.com.br
set -euo pipefail

NOVO="${1:-}"
ATUAL="www.ybsservicos.com.br"

if [ -z "$NOVO" ]; then
  echo "Uso: ./trocar-dominio.sh www.seudominio.com.br"
  exit 1
fi

cd "$(dirname "$0")"
grep -rl "$ATUAL" site/ README.md 2>/dev/null | while read -r arquivo; do
  perl -pi -e "s/\Q$ATUAL\E/$NOVO/g" "$arquivo"
  echo "atualizado: $arquivo"
done
echo
echo "Pronto. Domínio agora é $NOVO."
echo "Lembre de refazer o deploy no EasyPanel."
