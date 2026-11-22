"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Centro aproximado do Ceará: [latitude, longitude]
const CENTRO_CEARA = [-5.2, -39.3];

// Camada 1: municípios do Ceará (IBGE, Malha Municipal 2025)
const ESTILO_MUNICIPIO = {
    color: "#38bdf8",
    weight: 1,
    opacity: 0.95,
    fillColor: "#38bdf8",
    fillOpacity: 0.12,
};

// Camada 2: meus desenhos de Sobral (geojson.io)
const ESTILO_DESENHO = {
    color: "#f59e0b",
    weight: 3,
    opacity: 1,
    fillColor: "#f59e0b",
    fillOpacity: 0.3,
};

const ESTILO_DESTAQUE = {
    weight: 5,
    fillOpacity: 0.5,
};

function estiloBotao(ativo) {
    return {
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        fontSize: 12,
        fontWeight: "bold",
        cursor: "pointer",
        background: ativo ? "#0284c7" : "transparent",
        color: ativo ? "#ffffff" : "#94a3b8",
    };
}

const ESTILO_CAIXA_BOTOES = {
    position: "absolute",
    right: 12,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 4,
    display: "flex",
    gap: 4,
};

// Busca um arquivo GeoJSON da pasta public/
function buscarGeoJSON(caminho) {
    return fetch(caminho).then((resposta) => {
        if (!resposta.ok) {
            throw new Error(`Falha ao baixar ${caminho}: HTTP ${resposta.status}`);
        }
        return resposta.json();
    });
}

// Ajusta o zoom para a camada escolhida (Ceará inteiro ou os desenhos de Sobral)
function Enquadramento({ dados }) {
    const mapa = useMap();

    useEffect(() => {
        if (!dados) return;
        const limites = L.geoJSON(dados).getBounds();
        mapa.fitBounds(limites, { padding: [30, 30] });
    }, [dados, mapa]);

    return null;
}

export default function MapaVetorial({ onSelecionarFeicao }) {
    const [municipios, setMunicipios] = useState(null);
    const [desenhos, setDesenhos] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [tipoCamada, setTipoCamada] = useState("satelite");
    const [enquadrar, setEnquadrar] = useState("ceara");

    // Faz o pedido dos dois arquivos uma única vez, quando o mapa aparece na tela
    useEffect(() => {
        Promise.all([
            buscarGeoJSON("/municipios-ce.geojson"),
            buscarGeoJSON("/sobral.geojson"),
        ])
            .then(([dadosMunicipios, dadosDesenhos]) => {
                setMunicipios(dadosMunicipios);
                setDesenhos(dadosDesenhos);
            })
            .catch((erro) => {
                console.error("Erro ao carregar o GeoJSON:", erro);
            })
            .finally(() => {
                setCarregando(false);
            });
    }, []);

    // O Leaflet chama esta função uma vez para cada município do IBGE
    function aoConfigurarMunicipio(feature, layer) {
        const atributos = feature.properties;

        layer.bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a;">
                <h4 style="margin: 0 0 6px 0; color: #0284c7; font-size: 15px;">${atributos.NM_MUN}</h4>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Região imediata:</strong> ${atributos.NM_RGI}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Região intermediária:</strong> ${atributos.NM_RGINT}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Área:</strong> ${atributos.AREA_KM2.toLocaleString("pt-BR")} km²</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Código IBGE:</strong> ${atributos.CD_MUN}</p>
            </div>
        `);

        layer.on({
            mouseover: () => layer.setStyle(ESTILO_DESTAQUE),
            mouseout: () => layer.setStyle(ESTILO_MUNICIPIO),
            click: () => onSelecionarFeicao({ origem: "ibge", atributos }),
        });
    }

    // O Leaflet chama esta função uma vez para cada desenho feito no geojson.io
    function aoConfigurarDesenho(feature, layer) {
        const atributos = feature.properties;

        layer.bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a;">
                <h4 style="margin: 0 0 6px 0; color: #d97706; font-size: 15px;">${atributos.NOME}</h4>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Tipo:</strong> ${atributos.TIPO}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Categoria:</strong> ${atributos.CATEGORIA}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Descrição:</strong> ${atributos.DESCRICAO}</p>
            </div>
        `);

        layer.on({
            mouseover: () => layer.setStyle(ESTILO_DESTAQUE),
            mouseout: () => layer.setStyle(ESTILO_DESENHO),
            click: () => onSelecionarFeicao({ origem: "desenho", atributos }),
        });
    }

    // Pontos viram círculos (assim aceitam o mesmo estilo e destaque das outras geometrias)
    function desenharPonto(feature, latlng) {
        return L.circleMarker(latlng, { radius: 10 });
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
            {/* Alternador do mapa de fundo */}
            <div style={{ ...ESTILO_CAIXA_BOTOES, top: 12 }}>
                <button type="button" onClick={() => setTipoCamada("satelite")} style={estiloBotao(tipoCamada === "satelite")}>
                    Satélite
                </button>
                <button type="button" onClick={() => setTipoCamada("ruas")} style={estiloBotao(tipoCamada === "ruas")}>
                    Ruas
                </button>
            </div>

            {/* Alternador do enquadramento */}
            <div style={{ ...ESTILO_CAIXA_BOTOES, top: 56 }}>
                <button type="button" onClick={() => setEnquadrar("ceara")} style={estiloBotao(enquadrar === "ceara")}>
                    Ceará
                </button>
                <button type="button" onClick={() => setEnquadrar("sobral")} style={estiloBotao(enquadrar === "sobral")}>
                    Sobral
                </button>
            </div>

            {carregando && (
                <div style={{ position: "absolute", top: 12, left: 56, zIndex: 1000, background: "rgba(15, 23, 42, 0.85)", color: "#38bdf8", padding: "6px 12px", borderRadius: 6, fontSize: 12, border: "1px solid #334155" }}>
                    Carregando GeoJSON...
                </div>
            )}

            <MapContainer center={CENTRO_CEARA} zoom={7} style={{ height: "100%", width: "100%" }}>
                {tipoCamada === "satelite" ? (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="&copy; ESRI World Imagery"
                        maxZoom={19}
                    />
                ) : (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                        maxZoom={19}
                    />
                )}

                <Enquadramento dados={enquadrar === "ceara" ? municipios : desenhos} />

                {/* Camada 1 (embaixo): municípios do IBGE */}
                {municipios && (
                    <GeoJSON
                        data={municipios}
                        style={ESTILO_MUNICIPIO}
                        onEachFeature={aoConfigurarMunicipio}
                    />
                )}

                {/* Camada 2 (em cima): meus desenhos de Sobral */}
                {desenhos && (
                    <GeoJSON
                        data={desenhos}
                        style={ESTILO_DESENHO}
                        pointToLayer={desenharPonto}
                        onEachFeature={aoConfigurarDesenho}
                    />
                )}
            </MapContainer>
        </div>
    );
}
