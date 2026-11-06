
(async function () {
  const container = document.getElementById("featuredVehicles");

  if (!container) {
    console.error("featuredVehicles container not found");
    return;
  }

  try {
    const vehicles = await api("/api/vehicles");

    const available = vehicles
      .filter(vehicle => vehicle.status === "Available")
      .slice(0, 3);

    if (available.length > 0) {
      container.innerHTML = available
        .map(vehicleCard)
        .join("");
    } else {
      container.innerHTML = `
        <div class="loading-card">
          No available vehicles yet.
          Visit the admin page to add vehicles.
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `
      <div class="loading-card">
        ${escapeHtml(error.message)}.
        Start the Express server and check MySQL setup.
      </div>
    `;

    console.error("Vehicle loading error:", error);
  }
})();
