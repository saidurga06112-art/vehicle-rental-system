(async function () {
  const form = document.getElementById("bookingForm");
  const select = document.getElementById("bookingVehicle");
  const message = document.getElementById("bookingMessage");
  const pickup = document.getElementById("pickupDate");
  const ret = document.getElementById("returnDate");

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

  pickup.min = today.toISOString().slice(0, 10);
  ret.min = pickup.min;

  pickup.addEventListener("change", () => {
    ret.min = pickup.value || pickup.min;
  });

  async function loadVehicles() {
    const vehicles = await api("/api/vehicles");

    const available = vehicles.filter(
      v => String(v.status).toLowerCase() === "available"
    );

    select.innerHTML =
      '<option value="">Choose a vehicle</option>' +
      available.map(v => `
        <option value="${v.vehicle_id}">
          ${escapeHtml(v.veh_model)} ·
          ${escapeHtml(v.vehicle_num)} ·
          ${money(v.rent_per_day)}/day
        </option>
      `).join("");

    const chosen = new URLSearchParams(location.search).get("vehicle");

    if (chosen && available.some(v => String(v.vehicle_id) === chosen)) {
      select.value = chosen;
    }

    if (!available.length) {
      select.innerHTML =
        '<option value="">No available vehicles</option>';
    }
  }

  try {
    await loadVehicles();
  } catch (error) {
    select.innerHTML =
      '<option value="">Could not load vehicles</option>';
    message.textContent = error.message;
    message.classList.add("error");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Submitting booking…";
    message.classList.remove("error");

    const payload = Object.fromEntries(new FormData(form));

    try {
      const result = await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      message.textContent =
        `Booking #${result.booking_id} created. ` +
        `${result.rental_days} day(s), total ${money(result.total_amount)}.`;

      form.reset();
      await loadVehicles();

    } catch (error) {
      message.textContent = error.message;
      message.classList.add("error");
    }
  });
})();