(async function () {
  const grid = document.getElementById("vehicleGrid");
  const search = document.getElementById("vehicleSearch");
  const count = document.getElementById("vehicleCount");
  let vehicles = [];
  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = vehicles.filter(v => `${v.model} ${v.num} ${v.status}`.toLowerCase().includes(term));
    count.textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"} found`;
    grid.innerHTML = filtered.length ? filtered.map(vehicleCard).join("") : '<div class="loading-card">No vehicles match your search.</div>';
  }
  search.addEventListener("input", render);
  try { vehicles = await api("/api/vehicles"); render(); }
  catch (error) { grid.innerHTML = `<div class="loading-card">${escapeHtml(error.message)}</div>`; count.textContent = "Fleet unavailable"; }
})();
