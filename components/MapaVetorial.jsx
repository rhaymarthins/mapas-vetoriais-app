"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Centro aproximado da área desenhada em Sobral-CE: [latitude, longitude]
const CENTRO_SOBRAL = [-3.6875, -40.3485];

const ESTILO_FEICAO = {
    color: "#38bdf8",
    weight: 3,
    opacity: 0.95,
    fillColor: "#38bdf8",
    fillOpacity: 0.2,
};

const ESTILO_DESTAQUE = {
    weight: 6,
    fillOpacity: 0.45,
};

function estiloBotaoCamada(ativo) {
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

// Quando o GeoJSON chega, ajusta o zoom para todos os desenhos caberem na tela
function EnquadrarDesenhos({ dados }) {
    const mapa = useMap();

    useEffect(() => {
        const limites = L.geoJSON(dados).getBounds();
        mapa.fitBounds(limites, { padding: [30, 30] });
    }, [dados, mapa]);

    return null;
}

export default function MapaVetorial({ onSelecionarFeicao }) {
    const [dadosVetor, setDadosVetor] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [tipoCamada, setTipoCamada] = useState("satelite");

    // Faz o pedido do arquivo uma única vez, quando o mapa aparece na tela
    useEffect(() => {
        fetch("/sobral.geojson")
            .then((resposta) => {
                if (!resposta.ok) {
                    throw new Error(`Falha ao baixar o GeoJSON: HTTP ${resposta.status}`);
                }
                return resposta.json();
            })
            .then((dados) => {
                setDadosVetor(dados);
            })
            .catch((erro) => {
                console.error("Erro ao carregar o GeoJSON:", erro);
            })
            .finally(() => {
                setCarregando(false);
            });
    }, []);

    // Pontos viram círculos (assim aceitam o mesmo estilo e o destaque dos polígonos e da linha)
    function desenharPonto(feature, latlng) {
        return L.circleMarker(latlng, { radius: 10 });
    }

    // O Leaflet chama esta função uma vez para cada desenho do GeoJSON
    function aoConfigurarFeicao(feature, layer) {
        const atributos = feature.properties;

        const conteudoPopup = `
            <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a;">
                <h4 style="margin: 0 0 6px 0; color: #0284c7; font-size: 15px;">${atributos.NOME}</h4>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Tipo:</strong> ${atributos.TIPO}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Categoria:</strong> ${atributos.CATEGORIA}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Descrição:</strong> ${atributos.DESCRICAO}</p>
            </div>
        `;

        layer.bindPopup(conteudoPopup);

        layer.on({
            mouseover: () => layer.setStyle(ESTILO_DESTAQUE),
            mouseout: () => layer.setStyle(ESTILO_FEICAO),
            click: () => onSelecionarFeicao(atributos),
        });
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
            {/* Alternador do mapa de fundo */}
            <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, background: "rgba(15, 23, 42, 0.9)", border: "1px solid #334155", borderRadius: 8, padding: 4, display: "flex", gap: 4 }}>
                <button type="button" onClick={() => setTipoCamada("satelite")} style={estiloBotaoCamada(tipoCamada === "satelite")}>
                    Satélite
                </button>
                <button type="button" onClick={() => setTipoCamada("ruas")} style={estiloBotaoCamada(tipoCamada === "ruas")}>
                    Ruas
                </button>
            </div>

            {carregando && (
                <div style={{ position: "absolute", top: 12, left: 56, zIndex: 1000, background: "rgba(15, 23, 42, 0.85)", color: "#38bdf8", padding: "6px 12px", borderRadius: 6, fontSize: 12, border: "1px solid #334155" }}>
                    Carregando GeoJSON...
                </div>
            )}

            <MapContainer center={CENTRO_SOBRAL} zoom={15} style={{ height: "100%", width: "100%" }}>
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

                {dadosVetor && <EnquadrarDesenhos dados={dadosVetor} />}

                {dadosVetor && (
                    <GeoJSON
                        data={dadosVetor}
                        style={ESTILO_FEICAO}
                        pointToLayer={desenharPonto}
                        onEachFeature={aoConfigurarFeicao}
                    />
                )}
            </MapContainer>
        </div>
    );
}
