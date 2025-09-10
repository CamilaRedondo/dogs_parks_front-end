# Sistema de Registro e Visualização de Parques

Este é um projeto web para registrar e visualizar parques caninos em um mapa interativo. Ele utiliza tecnologias como **Leaflet.js** para renderização do mapa, **Bootstrap** para estilização e faz integração com APIs externas para buscar dados de localização e geocodificação.

## Funcionalidades

- Visualização de um mapa interativo.
- Registro de parques com informações detalhadas, como endereço, estrutura, finalidade e tipo de acesso.
- Listagem e filtragem de parques.
- Integração com APIs externas para preenchimento dinâmico de estados, cidades e geocodificação de endereços.

## 🚀 Instruções de Instalação

Siga as etapas abaixo para configurar o ambiente local e executar o projeto:

### 1. Clonar o Repositório

Clone este repositório para o seu ambiente local:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Configurar o Servidor Backend 

Certifique-se de que o servidor backend esteja configurado e em execução na URL http://127.0.0.1:5000. Ele deve fornecer as seguintes rotas:

/estruturas/ - Retorna as opções de estrutura.
/finalidades/ - Retorna as opções de finalidade.
/tipos-acesso/ - Retorna os tipos de acesso.
/parques/ - Endpoint para registrar parques.

### 3. Executar o Projeto

Inicie um servidor local para servir os arquivos HTML, CSS e JavaScript. Você pode usar o Live Server do Visual Studio Code ou qualquer outro servidor estático.

Se estiver usando o Live Server, clique com o botão direito no arquivo index.html e selecione "Open with Live Server".

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- Leaflet.js (para mapas interativos)
- Bootstrap 5 (para estilização e modais)
- APIs públicas do IBGE e OpenStreetMap (para dados de localização e geocodificação)

## 📂 Estrutura do Projeto

## 📧 Contato

Se tiver dúvidas ou sugestões, entre em contato:

Nome: Camila Silveira Redondo
Email: caredondo97@gmail.com