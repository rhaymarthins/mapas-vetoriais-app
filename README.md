# Mapas Vetoriais e Tabela de Atributos: Ceará e Sobral

Projeto da **Aula 07 de SIG-Web** (Pós-Graduação em Desenvolvimento Web e Mobile), professor José Rui.

A aplicação mostra no mapa duas camadas vetoriais em **GeoJSON**:

1. **Municípios do Ceará:** os 184 municípios da **Malha Municipal 2025 do IBGE**, convertidos de Shapefile para GeoJSON.
2. **Pontos de interesse de Sobral-CE:** desenhados por mim no [geojson.io](https://geojson.io), com atributos próprios.

Ao tocar ou clicar em um município ou em um desenho, os atributos dele aparecem num **balão (Popup)** no mapa e no painel **Tabela de Atributos**.

## Funcionalidades

- Mapa interativo com **Leaflet**, com fundo de **satélite** ou de **ruas**
- Camada oficial do IBGE com os 184 municípios do Ceará
- Os três tipos de geometria do GeoJSON nos desenhos de Sobral:
  - **Polígono:** UFC - Campus Sobral e Parque Lagoa da Fazenda
  - **Linha:** Boulevard do Arco
  - **Ponto:** IFCE - Campus Sobral e Sobral Shopping
- Popup com a tabela de atributos de cada desenho
- Painel com os atributos da feição selecionada
- Destaque visual ao passar o mouse sobre um desenho
- Botões **Ceará / Sobral** que enquadram o mapa no estado inteiro ou nos desenhos de Sobral

## Tecnologias

- [Next.js](https://nextjs.org) (App Router) e React, em JavaScript
- [Leaflet](https://leafletjs.com) e [React-Leaflet](https://react-leaflet.js.org)
- GeoJSON (RFC 7946)
- [Mapshaper](https://mapshaper.org), para converter o Shapefile do IBGE
- Mapas de fundo: ESRI World Imagery (satélite) e OpenStreetMap (ruas)

## Estrutura do projeto

```
mapas-vetoriais-app/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.jsx           # Molde HTML raiz
│   ├── page.jsx             # Página principal e painel da Tabela de Atributos
│   └── page.module.css      # Estilos da página
├── components/
│   └── MapaVetorial.jsx     # Mapa Leaflet: carrega e desenha as duas camadas
├── public/
│   ├── municipios-ce.geojson  # Municípios do Ceará (IBGE, Malha Municipal 2025)
│   └── sobral.geojson         # Pontos de interesse desenhados no geojson.io
└── package.json
```

## Os dados

Os dois arquivos ficam na pasta `public/`, então são servidos pelo próprio app (`/municipios-ce.geojson` e `/sobral.geojson`), sem depender de servidor de mapas externo. Em ambos, cada feição tem duas partes:

- **`geometry`:** o tipo (`Point`, `LineString` ou `Polygon`) e as coordenadas, na ordem **[longitude, latitude]**
- **`properties`:** a tabela de atributos

### Municípios do Ceará (`municipios-ce.geojson`)

Origem: IBGE, Geociências › Malhas territoriais › Malha Municipal 2025 › CE (`CE_Municipios_2025.zip`, Shapefile em SIRGAS 2000). Conversão feita com o Mapshaper:

```bash
npx mapshaper CE_Municipios_2025.shp \
  -simplify 3% keep-shapes \
  -filter-fields CD_MUN,NM_MUN,NM_RGI,NM_RGINT,AREA_KM2 \
  -proj wgs84 \
  -o precision=0.00001 municipios-ce.geojson format=geojson
```

| Campo | Significado |
|---|---|
| `NM_MUN` | Nome do município |
| `NM_RGI` | Região geográfica imediata |
| `NM_RGINT` | Região geográfica intermediária |
| `AREA_KM2` | Área em km² |
| `CD_MUN` | Código IBGE do município |

### Pontos de interesse de Sobral (`sobral.geojson`)

Desenhados no geojson.io e exportados em GeoJSON, já em **WGS 84**.

| Campo | Significado |
|---|---|
| `NOME` | Nome do lugar |
| `TIPO` | Tipo de geometria (Polígono, Linha ou Ponto) |
| `CATEGORIA` | Classificação do lugar (Educação, Lazer, Comércio…) |
| `DESCRICAO` | Descrição curta |

## Como funciona

1. **Importação sem SSR (`app/page.jsx`):** o Leaflet precisa dos objetos `window` e `document`, que só existem no navegador. Por isso o mapa é importado com `next/dynamic` e `ssr: false`.
2. **Carregamento dos arquivos (`useEffect`):** no `MapaVetorial.jsx`, um `useEffect` com lista de dependências vazia (`[]`) roda uma única vez, quando o mapa aparece. Ele faz o `fetch` dos dois GeoJSON (com `Promise.all`), confere se cada resposta veio certa (`resposta.ok`) e guarda os dados em estados.
3. **Desenho das camadas:** dois componentes `<GeoJSON />` desenham as camadas: primeiro os municípios (embaixo, em azul) e depois os desenhos de Sobral (em cima, em laranja). Os pontos são convertidos em círculos (`pointToLayer` com `L.circleMarker`), para receberem o mesmo estilo e destaque dos polígonos e da linha.
4. **Tabela de atributos (`onEachFeature`):** o Leaflet chama `aoConfigurarMunicipio` ou `aoConfigurarDesenho` para cada feição. Essas funções montam o Popup com as `properties` e, no clique, enviam os atributos para a página, que os mostra no painel com os campos certos de cada camada.
5. **Enquadramento:** o componente `Enquadramento` usa `fitBounds` para ajustar o zoom ao Ceará inteiro ou aos desenhos de Sobral, conforme o botão escolhido.

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
# Instalar as dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev
```

Depois, abra http://localhost:3000 no navegador.

## Deploy

O projeto está publicado na [Vercel](https://vercel.com). A cada `git push` na branch `main`, uma nova versão é publicada automaticamente.

**Link:** https://SEU-LINK.vercel.app

## Autor

**Antonio Ray Martins**, Pós-Graduação em Desenvolvimento Web e Mobile, disciplina de Sistemas de Informações Geográficas na Web.
