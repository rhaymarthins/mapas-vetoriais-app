"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// O Leaflet precisa do objeto window, que só existe no navegador
const MapaVetorial = dynamic(() => import("../components/MapaVetorial"), {
    ssr: false,
    loading: () => <p className={styles.instrucaoVazio}>Carregando o mapa...</p>,
});

export default function Home() {
    const [feicao, setFeicao] = useState(null);

    return (
        <main className={styles.container}>
            <header className={styles.cabecalho}>
                <h1>Mapas Vetoriais e Tabela de Atributos</h1>
                <p>Pontos de interesse de Sobral-CE desenhados no geojson.io</p>
            </header>

            <section className={styles.mapaWrapper}>
                <MapaVetorial onSelecionarFeicao={setFeicao} />
            </section>

            <section className={styles.cardPainel}>
                <h2 className={styles.cardTitulo}>Tabela de Atributos (properties)</h2>

                {feicao ? (
                    <div className={styles.gridAtributos}>
                        <div className={styles.itemAtributo}>
                            <div className={styles.itemRotulo}>Nome</div>
                            <div className={styles.itemValor}>{feicao.NOME}</div>
                        </div>
                        <div className={styles.itemAtributo}>
                            <div className={styles.itemRotulo}>Tipo de geometria</div>
                            <div className={styles.itemValor}>{feicao.TIPO}</div>
                        </div>
                        <div className={styles.itemAtributo}>
                            <div className={styles.itemRotulo}>Categoria</div>
                            <div className={styles.itemValor}>{feicao.CATEGORIA}</div>
                        </div>
                        <div className={styles.itemAtributo}>
                            <div className={styles.itemRotulo}>Descrição</div>
                            <div className={styles.itemValor}>{feicao.DESCRICAO}</div>
                        </div>
                    </div>
                ) : (
                    <p className={styles.instrucaoVazio}>
                        Toque ou clique em um desenho do mapa para consultar os atributos do GeoJSON.
                    </p>
                )}
            </section>

            <footer className={styles.rodape}>
                SIG-Web, Prof. José Rui. Dados: desenhados no geojson.io (Sobral-CE).
            </footer>
        </main>
    );
}
