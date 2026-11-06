
/* ===============================
   PRICE FORMAT
================================ */

const money = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};


/* ===============================
   IMAGE PATH
================================ */

function imagePath(image) {
  if (!image) {
    return "/images/car-default.svg";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return "/" + image.replace(/^public\//, "");
}


/* ===============================
   VEHICLE STATUS
================================ */

function statusClass(status) {
  const s = String(status || "").toLowerCase();

  if (s === "available") {
    return "status-available";
  }

  if (s === "rented" || s === "booked" || s === "confirmed") {
    return "status-rented";
  }

  if (s === "returned" || s === "cancelled") {
    return "status-available";
  }

  return "status-maintenance";
}


/* ===============================
   API FUNCTION
================================ */

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}


/* ===============================
   VEHICLE CARD
================================ */

function vehicleCard(vehicle) {
  return `
    <article class="vehicle-card">

      <div class="vehicle-image">

        <img
          src="${imagePath(vehicle.image_url)}"
          alt="${escapeHtml(vehicle.veh_name)}"
          onerror="this.onerror=null;this.src='/images/car-default.svg'"
        >

      </div>

      <div class="vehicle-info">

        <div class="vehicle-top">

          <div>

            <h3>
              ${escapeHtml(vehicle.veh_name)}
            </h3>

            <div class="vehicle-sub">
              ${escapeHtml(vehicle.vehicle_num)}
              ·
              ${escapeHtml(vehicle.veh_time || "Time not set")}
            </div>

            <div class="vehicle-sub">
              Model: ${escapeHtml(vehicle.veh_model)}
            </div>

          </div>

          <span class="status ${statusClass(vehicle.status)}">
            ${escapeHtml(vehicle.status)}
          </span>

        </div>

        <div class="vehicle-bottom">

          <div class="price">
            ${money(vehicle.rent_per_day)}
            <small>/ day</small>
          </div>

          <a
            class="card-link"
            href="/booking.html?vehicle=${encodeURIComponent(vehicle.vehicle_id)}"
          >
            Book ride ↗
          </a>

        </div>

      </div>

    </article>
  `;
}


/* ===============================
   HTML ESCAPE
================================ */

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch];
  });
}
