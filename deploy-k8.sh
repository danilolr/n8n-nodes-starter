#!/bin/bash

# --- Configurações ---
# Namespace onde o pod está localizado
NAMESPACE="n8n-home"
# NAMESPACE="n8n-prd"
# Prefixo do nome do pod (ex: "n8n-", o script encontrará o nome completo)
NOME_PREFIXO_POD="n8n-"
# Nome do arquivo local a ser copiado
ARQUIVO_LOCAL="n8n-nodes-atendimento.tar.gz"
# Diretório de trabalho DENTRO do pod. O arquivo será copiado para cá,
# e os comandos subsequentes serão executados a partir daqui.
DIRETORIO_TRABALHO_NO_POD="/home/node"
# Define se o script deve esperar a confirmação da deleção do pod (true/false)
# Usar "kubectl delete ... --wait" que geralmente é o padrão para true.
# Para kubectl < 1.5, --wait não existe, para 1.5+ --wait=true é o padrão.
# Para garantir, podemos verificar a versão do kubectl ou simplesmente usar --wait.
# Para este script, vamos assumir uma versão de kubectl que suporte --wait.
DELETE_POD_WAIT_FLAG="--wait=true" # Pode ser ajustado para "" se não quiser esperar ou se causar problemas.
# --- Fim das Configurações ---

echo "------------------------------------------------------------------------------------"
echo "--- Script para Copiar Arquivo, Executar Comandos em Pod e Deletar Pod no K8s ---"
echo "------------------------------------------------------------------------------------"
echo

# 1. Verificar se o kubectl está instalado e acessível
echo "[PASSO 1/7] Verificando a instalação do kubectl..."
if ! command -v kubectl &> /dev/null
then
    echo "ERRO: O comando 'kubectl' não foi encontrado."
    echo "Por favor, certifique-se de que o kubectl está instalado e configurado no PATH do seu sistema."
    exit 1
fi
echo "INFO: kubectl encontrado em: $(command -v kubectl)"
echo

# 2. Verificar se o arquivo local existe
echo "[PASSO 2/7] Verificando a existência do arquivo local..."
if [ ! -f "$ARQUIVO_LOCAL" ]; then
  echo "ERRO: Arquivo local '$ARQUIVO_LOCAL' não encontrado no diretório atual: $(pwd)."
  echo "Por favor, certifique-se de que o arquivo está no local correto ou ajuste a variável 'ARQUIVO_LOCAL' no script."
  exit 1
fi
echo "INFO: Arquivo local encontrado: '$ARQUIVO_LOCAL'"
echo

# 3. Obter o nome completo do pod
echo "[PASSO 3/7] Procurando pelo pod no namespace '$NAMESPACE' com prefixo '$NOME_PREFIXO_POD'..."
POD_COMPLETO=$(kubectl get pods -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" | grep "^$NOME_PREFIXO_POD" | head -n 1)

if [ -z "$POD_COMPLETO" ]; then
  echo "ERRO: Nenhum pod encontrado com o prefixo '$NOME_PREFIXO_POD' no namespace '$NAMESPACE'."
  echo "Pods disponíveis no namespace '$NAMESPACE':"
  kubectl get pods -n "$NAMESPACE"
  echo "Por favor, verifique o namespace, o prefixo do nome do pod e se os pods estão em execução."
  exit 1
fi
echo "INFO: Pod encontrado: '$POD_COMPLETO' no namespace '$NAMESPACE'."
echo

# 4. Montar o caminho completo de destino no pod para o arquivo
NOME_ARQUIVO_DESTINO=$(basename "$ARQUIVO_LOCAL")
CAMINHO_ARQUIVO_DESTINO_NO_POD="${DIRETORIO_TRABALHO_NO_POD%/}/${NOME_ARQUIVO_DESTINO}"

echo "[PASSO 4/7] Definindo o caminho de destino do arquivo no pod..."
echo "INFO: O arquivo '$ARQUIVO_LOCAL' será copiado para '$POD_COMPLETO:$CAMINHO_ARQUIVO_DESTINO_NO_POD'."
echo

# 5. Copiar o arquivo usando kubectl cp
echo "[PASSO 5/7] Executando a cópia do arquivo para o pod..."
echo $POD_COMPLETO
echo $CAMINHO_ARQUIVO_DESTINO_NO_POD
echo "Comando: kubectl cp '$ARQUIVO_LOCAL' '$NAMESPACE/$POD_COMPLETO:$CAMINHO_ARQUIVO_DESTINO_NO_POD'"

kubectl cp "$ARQUIVO_LOCAL" "$NAMESPACE/$POD_COMPLETO:$CAMINHO_ARQUIVO_DESTINO_NO_POD"

if [ $? -eq 0 ]; then
  echo
  echo "SUCESSO! Arquivo '$ARQUIVO_LOCAL' copiado para '$POD_COMPLETO:$CAMINHO_ARQUIVO_DESTINO_NO_POD'."
  echo

  # 6. Executar comandos de setup e limpeza dentro do pod
  echo "[PASSO 6/7] Executando comandos de setup e limpeza dentro do pod '$POD_COMPLETO'..."
  
  COMANDOS_NO_POD="set -e; \
cd '$DIRETORIO_TRABALHO_NO_POD'; \
echo '--- [POD] Etapa 1/6: Removendo diretório dist antigo (se existir)... ---'; \
rm -rf dist; \
echo '--- [POD] Etapa 2/6: Extraindo $NOME_ARQUIVO_DESTINO... ---'; \
tar -zxvf '$NOME_ARQUIVO_DESTINO'; \
echo '--- [POD] Etapa 3/6: Removendo instalação custom antiga em /home/node/.n8n/custom/n8n-nodes-atendimento/ (se existir)... ---'; \
rm -rf /home/node/.n8n/custom/n8n-nodes-atendimento/; \
echo '--- [POD] Etapa 4/6: Garantindo que o diretório /home/node/.n8n/custom/ exista... ---'; \
mkdir -p /home/node/.n8n/custom/; \
echo '--- [POD] Etapa 5/6: Movendo novo diretório dist para /home/node/.n8n/custom/... $NOME_ARQUIVO_DESTINO ---'; \
mv dist/ /home/node/.n8n/custom/; \
echo '--- [POD] Etapa 6/6: Removendo o arquivo $NOME_ARQUIVO_DESTINO do pod... ---'; \
rm '$NOME_ARQUIVO_DESTINO'; \
echo '--- [POD] Todas as etapas de setup e limpeza no pod foram concluídas com sucesso. ---'"

  echo "Os seguintes comandos serão executados sequencialmente dentro do pod (em '$DIRETORIO_TRABALHO_NO_POD'):"
  echo "  1. cd $DIRETORIO_TRABALHO_NO_POD"
  echo "  2. rm -rf dist (limpeza pré-extração)"
  echo "  3. tar -zxvf $NOME_ARQUIVO_DESTINO"
  echo "  4. rm -rf /home/node/.n8n/custom/n8n-nodes-atendimento/ (limpeza de nó custom antigo)"
  echo "  5. mkdir -p /home/node/.n8n/custom/"
  echo "  6. mv dist/ /home/node/.n8n/custom/"
  echo "  7. rm $NOME_ARQUIVO_DESTINO (limpeza do .tar.gz)"
  echo
  echo "Executando via kubectl exec..."
  echo "Comando completo no pod: /bin/sh -c \"$COMANDOS_NO_POD\""
  echo
  
  kubectl exec -n "$NAMESPACE" "$POD_COMPLETO" -- /bin/sh -c "$COMANDOS_NO_POD"

  if [ $? -eq 0 ]; then
    echo
    echo "SUCESSO! Comandos de setup e limpeza executados dentro do pod '$POD_COMPLETO'."
    echo

    # 7. Deletar o pod
    echo "[PASSO 7/7] Deletando o pod '$POD_COMPLETO' no namespace '$NAMESPACE'..."
    echo "Comando: kubectl delete pod \"$POD_COMPLETO\" -n \"$NAMESPACE\" $DELETE_POD_WAIT_FLAG"
    kubectl delete pod "$POD_COMPLETO" -n "$NAMESPACE" $DELETE_POD_WAIT_FLAG

    if [ $? -eq 0 ]; then
      echo "SUCESSO! Pod '$POD_COMPLETO' deletado."
    else
      echo "AVISO: Falha ao deletar o pod '$POD_COMPLETO'. Pode ser necessário removê-lo manualmente."
      # Não saímos com erro aqui, pois a tarefa principal (cópia e setup) foi bem-sucedida.
      # Se a deleção do pod for crítica, você pode adicionar 'exit 1' aqui.
    fi
  else
    echo
    echo "ERRO: Falha ao executar comandos de setup e limpeza dentro do pod '$POD_COMPLETO'."
    echo "Verifique as mensagens de erro detalhadas do kubectl ou os logs do pod (a saída acima pode conter detalhes)."
    echo "kubectl exec -it $POD_COMPLETO -n=$NAMESPACE -- ash"
    exit 1 
  fi
else
  echo
  echo "ERRO: Falha ao copiar o arquivo '$ARQUIVO_LOCAL' para o pod '$POD_COMPLETO'."
  # (Mensagens de erro anteriores sobre possíveis causas)
  exit 1
fi

echo
echo "--- Script concluído ---"
