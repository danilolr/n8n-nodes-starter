rm ../docker/n8n_data/custom/n8n-nodes-atendimento -rf
pnpm run build
cp dist/ ../docker/n8n_data/custom/n8n-nodes-atendimento -R