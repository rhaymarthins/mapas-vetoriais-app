"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// O Leaflet precisa do objeto window, que só existe no navegador
const MapaVetorial = dynamic(() => import("../components/MapaVetorial"), {
    ssr: false,
    loading: () => <p className={styles.instrucaoVazio}>Carregando o mapa...</p>,
});

// Um item da Tabela de Atributos (rótulo + valor)
function Atributo({ rotulo, valor }) {
    return (
        <div className={styles.itemAtributo}>
            <div className={styles.itemRotulo}>{rotulo}</div>
            <div className={styles.itemValor}>{valor}</div>
        </div>
    );
}

export default function Home() {
    // Guarda a feição tocada: { origem: "ibge" | "desenho", atributos: {...} }
    const [feicao, setFeicao] = useState(null);

    return (
        <main className={styles.container}>
            <header className={styles.cabecalho}>
                <h1>Mapas Vetoriais e Tabela de Atributos</h1>
                <p>Municípios do Ceará (IBGE) e pontos de interesse de Sobral em GeoJSON</p>
            </header>

            <section className={styles.mapaWrapper}>
                <MapaVetorial onSelecionarFeicao={setFeicao} />
            </section>

            <section className={styles.cardPainel}>
                <h2 className={styles.cardTitulo}>Tabela de Atributos (properties)</h2>

                {feicao?.origem === "ibge" && (
                    <div className={styles.gridAtributos}>
                        <Atributo rotulo="Município" valor={feicao.atributos.NM_MUN} />
                        <Atributo rotulo="Região imediata" valor={feicao.atributos.NM_RGI} />
                        <Atributo rotulo="Região intermediária" valor={feicao.atributos.NM_RGINT} />
                        <Atributo rotulo="Área" valor={`${feicao.atributos.AREA_KM2.toLocaleString("pt-BR")} km²`} />
                        <Atributo rotulo="Código IBGE" valor={feicao.atributos.CD_MUN} />
                    </div>
                )}

                {feicao?.origem === "desenho" && (
                    <div className={styles.gridAtributos}>
                        <Atributo rotulo="Nome" valor={feicao.atributos.NOME} />
                        <Atributo rotulo="Tipo de geometria" valor={feicao.atributos.TIPO} />
                        <Atributo rotulo="Categoria" valor={feicao.atributos.CATEGORIA} />
                        <Atributo rotulo="Descrição" valor={feicao.atributos.DESCRICAO} />
                    </div>
                )}

                {!feicao && (
                    <p className={styles.instrucaoVazio}>
                        Toque ou clique em um município ou em um desenho para consultar os atributos do GeoJSON.
                    </p>
                )}
            </section>

            <footer className={styles.rodape}>
                SIG-Web, Prof. José Rui. Dados: IBGE, Malha Municipal 2025 (CE) e desenhos próprios no geojson.io.
            </footer>
        </main>
    );
}
