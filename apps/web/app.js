if (!localStorage.getItem("rgb_token")) {
  window.location.href = "login.html";
}

const apiBase = "http://localhost:8000";
let grounds = [];

const indexOptions = [
  "NDVI",
  "NDRE",
  "CLRE",
  "GLI",
  "GCC",
  "SMI_PROXY",
  "STRESS",
  "DISEASE_PROXY",
  "BSI_NIR_PROXY",
  "FCOVER",
];

const fallbackGrounds = [
  {
    id: "ground-01",
    name: "National Sports Arena",
    center: [72.8777, 19.076],
  },
  {
    id: "ground-02",
    name: "City Football Campus",
    center: [77.209, 28.6139],
  },
  {
    id: "ground-03",
    name: "Coastal Cricket Oval",
    center: [74.856, 12.9141],
  },
];

const layerOptions = [
  "Multispectral Ortho",
  "NDVI",
  "NDRE",
  "Moisture",
  "Stress",
];

const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: fallbackGrounds[0].center,
  zoom: 4,
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

const groundList = document.getElementById("ground-list");
const status = document.getElementById("status");
const aoiArea = document.getElementById("aoi-area");
const aoiPerimeter = document.getElementById("aoi-perimeter");
const indicesContainer = document.getElementById("indices");
const analysisResults = document.getElementById("analysis-results");
const drawButton = document.getElementById("draw-aoi");
const clearButton = document.getElementById("clear-aoi");
const runAnalysis = document.getElementById("run-analysis");

let currentGround = fallbackGrounds[0];
let drawing = false;
let drawCoords = [];
let aoiGeojson = null;

function renderGrounds() {
  groundList.innerHTML = "";
  grounds.forEach((ground) => {
    const item = document.createElement("li");
    item.textContent = ground.name;
    if (ground.id === currentGround.id) {
      item.classList.add("active");
    }
    item.addEventListener("click", () => {
      currentGround = ground;
      map.flyTo({ center: ground.center, zoom: 15 });
      status.textContent = `${ground.name} selected. Draw an AOI to analyze.`;
      renderGrounds();
    });
    groundList.appendChild(item);
  });
}

async function loadGrounds() {
  try {
    const response = await fetch(`${apiBase}/clients/client-01/grounds`);
    if (!response.ok) {
      throw new Error("Failed to load grounds");
    }
    const data = await response.json();
    grounds = data.map((ground) => ({
      ...ground,
      center: [ground.lon, ground.lat],
    }));
  } catch (error) {
    grounds = fallbackGrounds;
  }
  currentGround = grounds[0];
  renderGrounds();
}

function renderIndices() {
  indicesContainer.innerHTML = "";
  indexOptions.forEach((name) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = name;
    input.checked = ["NDVI", "NDRE", "GLI"].includes(name);
    label.appendChild(input);
    label.appendChild(document.createTextNode(name));
    indicesContainer.appendChild(label);
  });
}

function setNav(view) {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.add("hidden");
  });
  const panel = document.getElementById(`${view}-panel`);
  if (panel) {
    panel.classList.remove("hidden");
  }
}

function addAoiLayer() {
  if (map.getSource("aoi")) {
    map.getSource("aoi").setData(aoiGeojson);
    return;
  }
  map.addSource("aoi", { type: "geojson", data: aoiGeojson });
  map.addLayer({
    id: "aoi-fill",
    type: "fill",
    source: "aoi",
    paint: {
      "fill-color": "#22c55e",
      "fill-opacity": 0.2,
    },
  });
  map.addLayer({
    id: "aoi-outline",
    type: "line",
    source: "aoi",
    paint: {
      "line-color": "#22c55e",
      "line-width": 2,
    },
  });
}

function clearAoi() {
  drawCoords = [];
  aoiGeojson = null;
  aoiArea.textContent = "-";
  aoiPerimeter.textContent = "-";
  analysisResults.textContent = "";
  if (map.getLayer("aoi-fill")) {
    map.removeLayer("aoi-fill");
  }
  if (map.getLayer("aoi-outline")) {
    map.removeLayer("aoi-outline");
  }
  if (map.getSource("aoi")) {
    map.removeSource("aoi");
  }
}

function updateMetrics() {
  if (!aoiGeojson) {
    return;
  }
  const area = turf.area(aoiGeojson);
  const perimeter = turf.length(aoiGeojson, { units: "kilometers" });
  aoiArea.textContent = `${(area / 10000).toFixed(2)} ha`;
  aoiPerimeter.textContent = `${perimeter.toFixed(2)} km`;
}

function generateResults(selected) {
  const results = selected.map((index) => {
    const mean = (Math.random() * 0.4 + 0.3).toFixed(2);
    const min = (mean - 0.15).toFixed(2);
    const max = (Number(mean) + 0.15).toFixed(2);
    return `${index}: min ${min}, mean ${mean}, max ${max}`;
  });
  analysisResults.textContent = results.join("\n");
}

function setupCompare() {
  const layerA = document.getElementById("layer-a");
  const layerB = document.getElementById("layer-b");
  const opacity = document.getElementById("opacity");
  layerOptions.forEach((layer) => {
    const optionA = document.createElement("option");
    optionA.value = layer;
    optionA.textContent = layer;
    layerA.appendChild(optionA);

    const optionB = document.createElement("option");
    optionB.value = layer;
    optionB.textContent = layer;
    layerB.appendChild(optionB);
  });

  layerB.selectedIndex = 1;
  opacity.addEventListener("input", () => {
    const value = Number(opacity.value);
    if (map.getLayer("comparison")) {
      map.setPaintProperty("comparison", "raster-opacity", value);
    }
  });
}

map.on("load", () => {
  map.addSource("comparison", {
    type: "raster",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
  });
  map.addLayer({
    id: "comparison",
    type: "raster",
    source: "comparison",
    paint: { "raster-opacity": 0.6 },
  });
});

map.on("click", (event) => {
  if (!drawing) {
    return;
  }
  drawCoords.push([event.lngLat.lng, event.lngLat.lat]);
  if (drawCoords.length >= 3) {
    const polygon = turf.polygon([[...drawCoords, drawCoords[0]]]);
    aoiGeojson = polygon;
    addAoiLayer();
    updateMetrics();
  }
});

map.getCanvas().addEventListener("dblclick", (event) => {
  if (!drawing) {
    return;
  }
  event.preventDefault();
  drawing = false;
  status.textContent = "AOI captured. Run analysis to compute indices.";
});

loadGrounds();
renderIndices();
setupCompare();

const navButtons = document.querySelectorAll(".nav-button");
navButtons.forEach((button) => {
  button.addEventListener("click", () => setNav(button.dataset.view));
});
setNav("home");

drawButton.addEventListener("click", () => {
  drawing = true;
  drawCoords = [];
  clearAoi();
  status.textContent = "Drawing AOI... click to add points, double click to finish.";
});

clearButton.addEventListener("click", () => {
  drawing = false;
  clearAoi();
  status.textContent = "AOI cleared.";
});

runAnalysis.addEventListener("click", () => {
  if (!aoiGeojson) {
    status.textContent = "Draw an AOI before running analysis.";
    return;
  }
  const selected = Array.from(
    indicesContainer.querySelectorAll("input:checked")
  ).map((input) => input.value);
  fetch(`${apiBase}/grounds/${currentGround.id}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ground_id: currentGround.id,
      indices: selected,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Analysis failed");
      }
      return response.json();
    })
    .then((data) => {
      const results = Object.entries(data.results).map(
        ([index, stats]) =>
          `${index}: min ${stats.min}, mean ${stats.mean}, max ${stats.max}`
      );
      analysisResults.textContent = results.join("\n");
      status.textContent = "Analysis complete. Export or compare layers.";
    })
    .catch(() => {
      generateResults(selected);
      status.textContent = "Demo analysis complete (offline mode).";
    });
});

const exportButtons = document.querySelectorAll("[data-export]");
exportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.export;
    const payload = {
      ground: currentGround.name,
      aoi: aoiGeojson,
      summary: analysisResults.textContent || "No analysis run.",
    };
    let filename = `analysis.${type}`;
    let data;
    if (type === "csv") {
      data = `ground,summary\n${currentGround.name},"${analysisResults.textContent}"`;
    } else if (type === "geojson") {
      data = JSON.stringify(payload, null, 2);
    } else {
      data = JSON.stringify(payload, null, 2);
    }
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
});

const subtitle = document.querySelector(".subtitle");
if (subtitle) {
  subtitle.addEventListener("click", () => {
    localStorage.removeItem("rgb_token");
    window.location.href = "login.html";
  });
}
